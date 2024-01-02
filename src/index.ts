import loadEvents from './functions/loadEvents';
import { connectToMongoDB, connectToMB } from './database/connection';
import { coreService } from './services';
import { addCronJob } from './queue/queues/cronJob';
import { addChannelMessage } from './queue/queues/channelMessage';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';

async function app() {
  await loadEvents();
  await coreService.DiscordBotManager.LoginClient();
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ()
  setupRabbitMQHandlers();
  addCronJob();


  addChannelMessage("980858613587382325", "Hi")
}

app();
