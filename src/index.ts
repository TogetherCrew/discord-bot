import loadEvents from './functions/loadEvents';
import { connectToMongoDB, connectToMB } from './database/connection';
import { DiscordBotManager } from './utils/discord';
import { addCronJob } from './queue/jobs/cronJob';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import './queue/workers/cronWorker';

async function app() {
  await loadEvents();
  await DiscordBotManager.LoginClient();
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ()
  setupRabbitMQHandlers();
  addCronJob();
}
app();
