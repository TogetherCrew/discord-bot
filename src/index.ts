import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import * as Sentry from '@sentry/node';
import loadEvents from './functions/loadEvents';
import guildExtraction from './functions/guildExtraction';
import { Queue, Worker, Job } from 'bullmq';
import { Guild, databaseService } from 'tc_dbcomm';
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
  const connection = databaseService.connectionFactory('980858613587382322', config.mongoose.dbURL);

  guildExtraction(connection, client, '980858613587382322');
}

// // Define your function to extract messages
// async function extractMessagesDaily() {
//   try {
//     // Log success
//     console.log('Message extraction completed successfully.');
//   } catch (error) {
//     // Log the error if extraction fails
//     console.error('An error occurred during message extraction:', error);
//   }
// }

// // Create a queue instance with the Redis connection
// const queue = new Queue('discordExtractQueue', {
//   connection: {
//     host: 'localhost',
//     port: 6379,
//   },
// });
// queue.add('extractMessagesDaily', {}, {
//   repeat: {
//     cron: '0 12 * * *', // Run once a day at 12 PM
//   },
//   jobId: 'extractJob', // Optional: Provide a unique ID for the job
//   attempts: 3, // Number of times to retry the job if it fails
//   backoff: {
//     type: 'exponential',
//     delay: 1000, // Initial delay between retries in milliseconds
//   },
// } as never);

// // Create a worker to process the job
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const worker = new Worker('discordExtractQueue', async (job: Job<any, any, string> | undefined) => {
//   if (job) {
//     // Call the extractMessagesDaily function
//     await extractMessagesDaily();
//   }
// });

// // Listen for completed and failed events to log the job status
// worker.on('completed', job => {
//   console.log(`Job ${job?.id} completed successfully.`);
// });

// worker.on('failed', (job, error) => {
//   console.error(`Job ${job?.id} failed with error:`, error);
// });

app();
