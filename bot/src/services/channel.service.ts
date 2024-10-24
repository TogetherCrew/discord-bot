import { type Snowflake, type Message, type Channel, type Guild } from 'discord.js'
import coreService from './core.service'
import parentLogger from '../config/logger'

const logger = parentLogger.child({ module: 'ChannelService' })

/**
 * Send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string} message - message string.
 * @returns {Promise<Message | undefined>} - The sent message or undefined if unable to send.
 */
async function sendChannelMessage(discordId: Snowflake, message: string): Promise<Message | undefined> {
    const client = await coreService.DiscordBotManager.getClient()
    const channel = await client.channels.fetch(discordId)
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-optional-chain
    if (channel && (channel.isTextBased() || channel.isVoiceBased())) {
        return await channel.send(message)
    }
}

async function getChannelFromDiscordAPI(guild: Guild, channelId: Snowflake): Promise<Channel | null> {
    try {
        const channel = await guild.channels.fetch(channelId)
        return channel
    } catch (err) {
        logger.error({ guild_id: guild.id, channel_id: channelId, err }, 'Failed to fetch channel from discord API')
        return null
    }
}

export default {
    sendChannelMessage,
    getChannelFromDiscordAPI,
}
