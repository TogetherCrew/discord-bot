import loadEvents from './functions/loadEvents';
import { connectToMongoDB, connectToMB } from './database/connection';
import { coreService } from './services';
import { addCronJob } from './queue/queues/cronJob';
import { addSendChannelMessage } from './queue/queues/sendChannelMessage';

import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import './queue/workers/cronWorker';
import './queue/workers/sendChannelMessageWorker';

async function app() {
  await loadEvents();
  await coreService.DiscordBotManager.LoginClient();
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ()
  setupRabbitMQHandlers();
  addCronJob();


  addSendChannelMessage("980858613587382325", "Hi")
}

app();
