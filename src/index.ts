import { Channel, ChannelType, Client, GatewayIntentBits, Snowflake, TextChannel } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import cronJob from './functions/cronJon';
import { Queue, Worker, Job } from 'bullmq';
import RabbitMQ, { Event, MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
// import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events
import { connectDB } from './database';
import { databaseService } from '@togethercrew.dev/db';
import guildExtraction from './functions/guildExtraction';
import sendDirectMessage from './functions/sendDirectMessage';
import { createPrivateThreadAndSendMessage } from './functions/thread';
import fetchMembers from './functions/fetchMembers';
import fetchChannels from './functions/fetchChannels';
import fetchRoles from './functions/fetchRoles';
import { closeConnection } from './database/connection';

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
});

const partial =
  (func: any, ...args: any) =>
  (...rest: any) =>
    func(...args, ...rest);

const getSagaFromRabbitMessage = async (msg: Record<string, any>) => {
  if (!msg) return;

  const { content } = msg;
  const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

  return saga;
};

const fetchMethod = async (msg: any) => {
  console.log(`Starting  fetch initial with: ${msg}`);
  if (!msg) return;

  const saga = await getSagaFromRabbitMessage(msg);
  const guildId = saga.data['guildId'];
  const isGuildCreated = saga.data['created'];
  const connection = await databaseService.connectionFactory(guildId, config.mongoose.dbURL);

  if (isGuildCreated) {
    await fetchMembers(connection, client, guildId);
  } else {
    await guildExtraction(connection, client, guildId);
  }
  await closeConnection(connection);
  console.log(`Finished fetch initial data.`);
};

const notifyUserAboutAnalysisFinish = async (
  discordId: string,
  info: { guildId: Snowflake; message: string; useFallback: boolean }
) => {
  // related issue https://github.com/RnDAO/tc-discordBot/issues/68
  const { guildId, message, useFallback } = info;

  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  const arrayChannels = Array.from(channels, ([name, value]) => ({ ...value } as Channel));
  const textChannels = arrayChannels.filter(channel => channel.type == ChannelType.GuildText) as TextChannel[];
  const rawPositionBasedSortedTextChannels = textChannels.sort((textChannelA, textChannelB) =>
    textChannelA.rawPosition > textChannelB.rawPosition ? 1 : -1
  );
  const upperTextChannel = rawPositionBasedSortedTextChannels[0];

  try {
    sendDirectMessage(client, { discordId, message });
  } catch (error) {
    // can not send DM to the user
    // Will create a private thread and notify him/her about the status if useFallback is true
    if (useFallback)
      createPrivateThreadAndSendMessage(upperTextChannel, {
        threadName: 'TogetherCrew Status',
        message: `<@${discordId}> ${message}`,
      });
  }
};

const fetchInitialData = async (guildId: Snowflake) => {
  const connection = await databaseService.connectionFactory(guildId, config.mongoose.dbURL);
  await fetchRoles(connection, client, guildId);
  await fetchChannels(connection, client, guildId);
  await fetchMembers(connection, client, guildId);
  await closeConnection(connection);
};

// APP
async function app() {
  await loadEvents(client);
  await client.login(config.discord.botToken);
  await connectDB();

  // *****************************RABBITMQ
  await MBConnection.connect(config.mongoose.dbURL);
  await RabbitMQ.connect(config.rabbitMQ.url, RabbitMQQueue.DISCORD_BOT).then(() => {
    console.log('Connected to RabbitMQ!');
  });
  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async msg => {
    console.log(`Received ${Event.DISCORD_BOT.FETCH} event with msg: ${msg}`);
    if (!msg) return;

    const saga = await getSagaFromRabbitMessage(msg);

    const fn = partial(fetchMethod, msg);
    await saga.next(fn);
    console.log(`Finished ${Event.DISCORD_BOT.FETCH} event with msg: ${msg}`);
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.SEND_MESSAGE, async msg => {
    console.log(`Received ${Event.DISCORD_BOT.SEND_MESSAGE} event with msg: ${msg}`);
    if (!msg) return;

    const saga = await getSagaFromRabbitMessage(msg);

    const guildId = saga.data['guildId'];
    const discordId = saga.data['discordId'];
    const message = saga.data['message'];
    const useFallback = saga.data['useFallback'];

    const fn = notifyUserAboutAnalysisFinish.bind({}, discordId, { guildId, message, useFallback });
    await saga.next(fn);
    console.log(`Finished ${Event.DISCORD_BOT.SEND_MESSAGE} event with msg: ${msg}`);
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH_MEMBERS, async msg => {
    console.log(`Received ${Event.DISCORD_BOT.FETCH_MEMBERS} event with msg: ${msg}`);
    if (!msg) return;

    const saga = await getSagaFromRabbitMessage(msg);

    const guildId = saga.data['guildId'];

    const fn = fetchInitialData.bind({}, guildId);
    await saga.next(fn);
    console.log(`Finished ${Event.DISCORD_BOT.FETCH_MEMBERS} event with msg: ${msg}`);
  });

  // *****************************BULLMQ
  // Create a queue instance with the Redis connection
  const queue = new Queue('cronJobQueue', {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    },
  });
  queue.add('cronJob', {}, {
    repeat: {
      cron: '0 0 * * *', // Run once 00:00 UTC
      // cron: '* * * * *', // Run every minute
      // every: 10000
    },
    jobId: 'cronJob', // Optional: Provide a unique ID for the job
    attempts: 1, // Number of times to retry the job if it fails
    backoff: {
      type: 'exponential',
      delay: 1000, // Initial delay between retries in milliseconds
    },
  } as never);

  // Create a worker to process the job
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worker = new Worker(
    'cronJobQueue',
    async (job: Job<any, any, string> | undefined) => {
      if (job) {
        // Call the extractMessagesDaily function
        await cronJob(client);
      }
    },
    {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      },
    }
  );

  // Listen for completed and failed events to log the job status
  worker.on('completed', job => {
    console.log(`Job ${job?.id} completed successfully.`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed with error:`, error);
  });
}
app();
