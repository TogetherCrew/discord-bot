import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import cronJob from './functions/cronJon';
import { Queue, Worker, Job } from 'bullmq';
import RabbitMQ, { Event, MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
// import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events
import { connectDB } from './database';
import fetchMembers from './functions/fetchMembers';
import { databaseService } from '@togethercrew.dev/db';
import guildExtraction from './functions/guildExtraction';

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences],
});

const partial = (func: any, ...args: any) => (...rest: any) => func(...args, ...rest)

const fetchMethod = async (msg: any) => {
  console.log(`Starting fetchMethod with: ${msg}`)
  if (!msg) return;

  const { content } = msg
  const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid })
  const guildId = saga.data.get("guildId");
  const isGuildCreated = saga.data.get("created");
  const connection = await databaseService.connectionFactory(saga.data.get("guildId"), config.mongoose.dbURL);

  if (isGuildCreated === 'true') {
    await fetchMembers(connection, client, guildId)
  }
  else {
    await guildExtraction(connection, client, guildId)
  }
  console.log(`Finished fetchMethod.`)
}

// APP
async function app() {
  await loadEvents(client);
  await client.login(config.discord.botToken);
  await connectDB();


  // *****************************RABBITMQ
  await MBConnection.connect(config.mongoose.dbURL)
  await RabbitMQ.connect(config.rabbitMQ.url, RabbitMQQueue.DISCORD_BOT).then(() => {
    console.log("Connected to RabbitMQ!")
  })
  RabbitMQ.onEvent(Event.DISCORD_BOT.FETCH, async (msg) => {
    console.log(`Received ${Event.DISCORD_BOT.FETCH} event with msg: ${msg}`)
    if (!msg) return

    const { content } = msg
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid })

    const fn = partial(fetchMethod, msg)
    await saga.next(fn)
    console.log(`Finished ${Event.DISCORD_BOT.FETCH} event with msg: ${msg}`)
  })


  // *****************************BULLMQ
  // Create a queue instance with the Redis connection
  const queue = new Queue('cronJobQueue', {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    }
  });
  queue.add('cronJob', {}, {
    repeat: {
      cron: '0 12 * * *', // Run once a day at 12 PM
    },
    jobId: 'cronJob', // Optional: Provide a unique ID for the job
    attempts: 3, // Number of times to retry the job if it fails
    backoff: {
      type: 'exponential',
      delay: 1000, // Initial delay between retries in milliseconds
    },
  } as never);

  // Create a worker to process the job
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worker = new Worker('cronJobQueue', async (job: Job<any, any, string> | undefined) => {
    if (job) {
      // Call the extractMessagesDaily function
      await cronJob(client);
    }
  }, {
    connection: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    }
  });

  // Listen for completed and failed events to log the job status
  worker.on('completed', job => {
    console.log(`Job ${job?.id} completed successfully.`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed with error:`, error);
  });

}

app();



