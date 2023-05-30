import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import cronJob from './functions/cronJon';
import { Queue, Worker, Job } from 'bullmq';
import RabbitMQ, { MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import './rabbitmqEvents' // we need this import statement here to initialize RabbitMQ events

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.env,
  tracesSampleRate: 1.0,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences],
});

MBConnection.connect(config.mongoose.dbURL)
RabbitMQ.connect(config.rabbitMQ.url, RabbitMQQueue.DISCORD_BOT).then(() => {
  console.log("Connected to RabbitMQ!")
})
async function app() {
  await loadEvents(client);
  await client.login(config.discord.botToken);
}

app();


// Create a queue instance with the Redis connection
const queue = new Queue('cronJobQueue', {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  }
});
queue.add('cronJob', {}, {
  repeat: {
    // cron: '0 12 * * *', // Run once a day at 12 PM
    // cron: '*/10 * * * * *' // Run once a day at 12 PM
    cron: '0 * * * * *' // Run every minute
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
});

// Listen for completed and failed events to log the job status
worker.on('completed', job => {
  console.log(`Job ${job?.id} completed successfully.`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed with error:`, error);
});

