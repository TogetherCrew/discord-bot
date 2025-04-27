import { Channel, Guild, Message, NewsChannel, Snowflake, TextChannel, VoiceChannel } from 'discord.js'

import parentLogger from '../config/logger'
import coreService from './core.service'

const logger = parentLogger.child({ module: 'ChannelService' })

/**
 * Send message to channel
 * @param {Snowflake} discordId - channel discordId.
 * @param {string} message - message string.
 * @returns {Promise<Message | undefined>} - The sent message or undefined if unable to send.
 */
async function sendChannelMessage(discordId: Snowflake, message: string): Promise<Message | undefined> {
    const bot = coreService.DiscordBotManager.getInstance()
    const client = await bot.getClient()
    const channel = await client.channels.fetch(discordId)

    if (
        channel &&
        (channel instanceof TextChannel || channel instanceof NewsChannel || channel instanceof VoiceChannel)
    ) {
        return await channel.send(message)
    }

    return undefined
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
