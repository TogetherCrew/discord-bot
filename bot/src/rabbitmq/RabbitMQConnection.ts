import RabbitMQ, { Queue } from '@togethercrew.dev/tc-messagebroker'
import config from '../config'
import logger from '../config/logger'

// Connect to RabbitMQ
export const connectToRabbitMQ = async (): Promise<void> => {
    try {
        await RabbitMQ.connect(config.rabbitMQ.url, Queue.DISCORD_BOT)
        logger.info({ queue: Queue.DISCORD_BOT }, 'Connected to RabbitMQ!')
    } catch (error) {
        logger.fatal(
            { queue: Queue.DISCORD_BOT, error },
            'Failed to connect to RabbitMQ!'
        )
    }
}
