import { connectToMongoDB, connectToMB } from './database/connection';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import { commandService, eventService, coreService } from './services';
import parentLogger from './config/logger';
import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { channelMessageQueue } from './queue/queues/channelMessage';
import { guildExtractionQueue } from './queue/queues/guildExtraction';
import { discordEventQueue } from './queue/queues/discordEvent';
import { cronJobQueue, addCronJob } from './queue/queues/cronJob';
import { directMessageQueue } from './queue/queues/directMessage';
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

  // Initialize Express
  const app = express();
  const port = 3000; // Port for the Express server

  // Initialize bull-board
  const serverAdapter = new ExpressAdapter();
  createBullBoard({
    queues: [
      new BullMQAdapter(channelMessageQueue),
      new BullMQAdapter(guildExtractionQueue),
      new BullMQAdapter(discordEventQueue),
      new BullMQAdapter(cronJobQueue),
      new BullMQAdapter(directMessageQueue),
    ],
    serverAdapter,
  });

  // Serve bull-board
  serverAdapter.setBasePath('/admin/queues');
  app.use('/admin/queues', serverAdapter.getRouter());

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Bull-Board is available at http://localhost:${port}/admin/queues`);
  });
}

app().catch((error) => {
  logger.fatal({ error }, 'Failed to start the application!');
});
