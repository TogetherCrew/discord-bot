import { connectToMongoDB, connectToMB } from './database/connection';
import { addCronJob } from './queue/queues/cronJob';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import { commandService, eventService, coreService } from './services';
import parentLogger from './config/logger';
import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';
import './queue/workers/directMessageWorker';
import './queue/workers/discordEventWorker';
import './queue/workers/guildExtractionWorker';

const logger = parentLogger.child({ module: `app` });

async function app(): Promise<void> {
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ();
  await coreService.DiscordBotManager.initClient();
  await coreService.DiscordBotManager.LoginClient();
  await eventService.loadEvents();
  await commandService.loadCommands();
  await commandService.registerCommand();
  setupRabbitMQHandlers();
  addCronJob();
}

app().catch((error) => {
  logger.fatal({ error }, 'Failed to start the application');
});
