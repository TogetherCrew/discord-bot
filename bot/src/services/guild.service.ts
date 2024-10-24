import { type Guild, type Snowflake } from 'discord.js'
import coreService from './core.service'
import parentLogger from '../config/logger'

const logger = parentLogger.child({ module: 'GuildService' })

async function getGuildFromDiscordAPI(guildId: Snowflake): Promise<Guild | null> {
    try {
        const client = await coreService.DiscordBotManager.getClient()
        const guild = await client.guilds.fetch(guildId)
        return guild
    } catch (err) {
        logger.error({ guild_id: guildId, err }, 'Failed to fetch guild from discord API')
        return null
    }
}

export default {
    getGuildFromDiscordAPI,
}
