/* eslint-disable @typescript-eslint/no-explicit-any */
import { Channel, ChannelType, Client, GatewayIntentBits, Snowflake, TextChannel, REST, Routes } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loaders//loadEvents';
import loadCommands from './functions/loaders/loadCommands';
import cronJob from './functions/fetchData/cronJon';
import { Queue, Worker, Job } from 'bullmq';
import RabbitMQ, { Event, MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
// import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events
import { connectDB } from './database';
import { databaseService } from '@togethercrew.dev/db';
import guildExtraction from './functions/fetchData//guildExtraction';
import sendDirectMessage from './functions/sendDirectMessage';
import { createPrivateThreadAndSendMessage } from './functions/thread';
import fetchMembers from './functions/fetchData/fetchMembers';
import fetchChannels from './functions/fetchData/fetchChannels';
import fetchRoles from './functions/fetchData/fetchRoles';
import parentLogger from './config/logger';
import { createFollowUpMessage, createInteractionResponse, deleteOriginalInteractionResponse, editOriginalInteractionResponse } from './functions/interactions/responses'
import { ChatInputCommandInteraction_broker, InteractionResponse, FollowUpMessageData, InteractionResponseEditData } from './interfaces/Hivemind.interfaces';
import DatabaseManager from './database/connection';

const logger = parentLogger.child({ module: 'App' });

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

const fetchMethod = async (msg: any) => {
  logger.info({ msg }, 'fetchMethod is running');
  if (!msg) return;
  const { content } = msg;
  const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
  logger.info({ saga: saga.data }, 'the saga info');
  const guildId = saga.data['guildId'];
  const isGuildCreated = saga.data['created'];
  const connection = DatabaseManager.getInstance().getTenantDb(guildId);
  if (isGuildCreated) {
    await fetchMembers(connection, client, guildId);
    await fetchRoles(connection, client, guildId);
    await fetchChannels(connection, client, guildId);
  } else {
    await guildExtraction(connection, client, guildId);
  }
  logger.info({ msg }, 'fetchMethod is done');
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
  const connection = DatabaseManager.getInstance().getTenantDb(guildId);
  await fetchRoles(connection, client, guildId);
  await fetchChannels(connection, client, guildId);
  await fetchMembers(connection, client, guildId);
};

// APP
async function app() {
  await loadEvents(client);
  await loadCommands(client);
  await client.login(config.discord.botToken);
  await connectDB();
  await registerCommand()
  // await edit()
  // *****************************RABBITMQ
  try {
    await MBConnection.connect(config.mongoose.dbURL);
  } catch (error) {
    logger.fatal({ url: config.mongoose.dbURL, error }, 'Failed to connect to MongoDB!');
  }
  await RabbitMQ.connect(config.rabbitMQ.url, RabbitMQQueue.DISCORD_BOT)
    .then(() => {
      logger.info({ url: config.rabbitMQ.url, queue: RabbitMQQueue.DISCORD_BOT }, 'Connected to RabbitMQ!');
    })
    .catch(error =>
      logger.fatal(
        { url: config.rabbitMQ.url, queue: RabbitMQQueue.DISCORD_BOT, error },
        'Failed to connect to RabbitMQ!'
      )
    );

  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async msg => {
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH }, 'is running');
    if (!msg) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

    const fn = partial(fetchMethod, msg);
    await saga.next(fn);
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH }, 'is done');
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.SEND_MESSAGE, async msg => {
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE }, 'is running');
    if (!msg) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

    const guildId = saga.data['guildId'];
    const discordId = saga.data['discordId'];
    const message = saga.data['message'];
    const useFallback = saga.data['useFallback'];

    const fn = notifyUserAboutAnalysisFinish.bind({}, discordId, { guildId, message, useFallback });
    await saga.next(fn);
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE }, 'is done');
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH_MEMBERS, async msg => {
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS }, 'is running');
    if (!msg) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });

    const guildId = saga.data['guildId'];

    const fn = fetchInitialData.bind({}, guildId);
    await saga.next(fn);
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS }, 'is done');
  });


  RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE, async msg => {
    const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
    const data: InteractionResponse = JSON.parse(msg?.content.data);
    await createInteractionResponse(interaction, data);

  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT, async msg => {
    const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
    const data: InteractionResponseEditData = JSON.parse(msg?.content.data);
    await editOriginalInteractionResponse(interaction, data)
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE, async msg => {
    const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
    await deleteOriginalInteractionResponse(interaction)
  });

  RabbitMQ.onEvent(Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE, async msg => {
    const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
    const data: FollowUpMessageData = JSON.parse(msg?.content.data);
    await createFollowUpMessage(interaction, data)
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
    attempts: 0, // Number of times to retry the job if it fails
    backoff: {
      type: 'exponential',
      delay: 1000, // Initial delay between retries in milliseconds
    },
    lockDuration: 79200000, // 22 hours
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
    logger.info({ job }, 'Job is done');
  });

  worker.on('failed', (job, error) => {
    logger.error({ job, error }, 'Job failed');
  });
}


async function registerCommand() {
  try {
    const rest = new REST().setToken(config.discord.botToken)
    const commandData = [...client.commands.values()].map(command => command.data.toJSON());

    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, "980858613587382322"),
      { body: commandData },
    );
  } catch (err) {
    logger.info({ err }, 'Failed to register the slash command');
  }
}
app();


