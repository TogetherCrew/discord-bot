import './queue/workers/cronWorker';
import './queue/workers/channelMessageWorker';
import './queue/workers/directMessageWorker';
import './queue/workers/guildEventWorker';
import './queue/workers/guildExtractionWorker';
import './queue/workers/userEventWorker';

import config from './config';
import parentLogger from './config/logger';
import { connectToMB, connectToMongoDB } from './database/connection';
import { addCronJob } from './queue/queues/cronJob';
import { connectToRabbitMQ } from './rabbitmq/RabbitMQConnection';
import { setupRabbitMQHandlers } from './rabbitmq/RabbitMQHandler';
import server from './server';
import { commandService, coreService, eventService } from './services';

const logger = parentLogger.child({ module: `app` })

async function app(): Promise<void> {
    await connectToMongoDB()
    await connectToMB()
    await connectToRabbitMQ()
    const bot = coreService.DiscordBotManager.getInstance();
    await bot.getClient()
    await eventService.loadEvents()
    await commandService.loadCommands()
    await commandService.registerCommand()

    server.listen(config.port, () => {
        logger.info(`Listening on ${config.port as string}`)
    })
    setupRabbitMQHandlers()
    addCronJob()
}

app().catch((error) => {
    logger.fatal(error, 'Failed To start the application!')
})
