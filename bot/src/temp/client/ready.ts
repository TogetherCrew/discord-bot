import { type Client, Events } from 'discord.js'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'ClientReady' })

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        logger.info('event is running!!!!!!!')
    },
}
