import { connectToMongoDB, connectToMB } from './database/connection';
import { coreService } from './services';
import { addCronJob } from './queue/queues/cronJob';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import { commandService, eventService } from './services';
import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';

async function app() {
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ();
  await coreService.DiscordBotManager.initClient();
  await eventService.loadEvents();
  await commandService.loadCommands();
  await commandService.registerCommand();
  await coreService.DiscordBotManager.LoginClient();
  setupRabbitMQHandlers();
  addCronJob();
}

app();
