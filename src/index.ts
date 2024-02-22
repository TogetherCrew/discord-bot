import server from './server';
import config from './config';
import { connectToMongoDB, connectToMB } from './database/connection';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import { commandService, eventService, coreService, channelService } from './services';
import parentLogger from './config/logger';
import { addCronJob } from './queue/queues/cronJob';
import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';
import './queue/workers/directMessageWorker';
import './queue/workers/guildEventWorker';
import './queue/workers/guildExtractionWorker';
import './queue/workers/userEventWorker';
// import pyroscope from './config/pyroscope';

const logger = parentLogger.child({ module: `app` });
// pyroscope();

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

  console.log(111)
  const message = await channelService.sendChannelMessage('980858613587382325', 'TEST');
  console.log(message?.id)
  console.log(message?.guildId)
  console.log(message?.channelId)


}

app().catch((error) => {
  logger.fatal({ error }, 'Failed to start the application!');
});
