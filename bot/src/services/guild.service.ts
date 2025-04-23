import { Guild, Snowflake } from 'discord.js';

import parentLogger from '../config/logger';
import coreService from './core.service';

const logger = parentLogger.child({ module: 'GuildService' })

async function getGuildFromDiscordAPI(guildId: Snowflake): Promise<Guild | null> {
    try {
        const bot = coreService.DiscordBotManager.getInstance()
        const client = await bot.getClient()
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
