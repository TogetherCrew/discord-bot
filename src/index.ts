import server from './server';
import config from './config';
import { connectToMongoDB, connectToMB } from './database/connection';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import { commandService, eventService, coreService, userService } from './services';
import parentLogger from './config/logger';
import { addCronJob } from './queue/queues/cronJob';
import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';
import './queue/workers/directMessageWorker';
import './queue/workers/guildEventWorker';
import './queue/workers/guildExtractionWorker';
import './queue/workers/userEventWorker';
import pyroscope from './config/pyroscope';

const logger = parentLogger.child({ module: `app` });
pyroscope();

async function app(): Promise<void> {
  await connectToMongoDB();
  await connectToMB();
  await connectToRabbitMQ();
  server.listen(config.port, () => {
    logger.info(`Listening on ${config.port as string}`);
  });
  await coreService.DiscordBotManager.initClient();
  await coreService.DiscordBotManager.LoginClient();
  await eventService.loadEvents();
  await commandService.loadCommands();
  await commandService.registerCommand();
  setupRabbitMQHandlers();
  addCronJob();
  await userService.sendDirectMessage('1049412581699367072', {
    guildId: '980858613587382322',
    message: 'Hi haj Behzad',
    useFallback: true,
    announcement: true,
    channelId: '1029501237554581564',
  });
}

app().catch((error) => {
  logger.fatal({ error }, 'Failed To start the application!');
});
