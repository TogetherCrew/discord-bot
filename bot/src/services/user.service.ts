import { type Channel, ChannelType, type Snowflake, type TextChannel } from 'discord.js'
import {} from 'discord.js'
import { createPrivateThreadAndSendMessage } from '../functions/thread'
import coreService from './core.service'
import channelService from './channel.service'
interface IInfo {
    guildId: Snowflake
    message: string
    useFallback: boolean
    channelId?: string
    announcement?: boolean
}
/**
 * Send direct message to user.
 * @param {Snowflake} discordId - user discordId.
 * @param {object} info - message string.
 * @returns {Promise<Message | undefined>} A promise that resolves with the sent message or undefined.
 */
async function sendDirectMessage(discordId: string, info: IInfo): Promise<void> {
    const client = await coreService.DiscordBotManager.getClient()
    const { guildId, message, useFallback, channelId } = info
    try {
        const user = await client.users.fetch(discordId)
        if (user !== null && user !== undefined) {
            await user.send(message)
        }
    } catch (error) {
        if (useFallback) {
            let channel: Channel | null
            let threadName: string
            if (info.announcement === false) {
                const guild = await client.guilds.fetch(guildId)
                const channels = await guild.channels.fetch()
                const arrayChannels = Array.from(channels, ([name, value]) => ({
                    ...value,
                })) as Channel[]
                const textChannels = arrayChannels.filter(
                    (channel) => channel.type === ChannelType.GuildText
                ) as TextChannel[]
                const rawPositionBasedSortedTextChannels = textChannels.sort((a, b) => a.rawPosition - b.rawPosition)
                channel = rawPositionBasedSortedTextChannels[0]
                threadName = 'TogetherCrew Status'
                await createPrivateThreadAndSendMessage(channel, {
                    threadName,
                    message: `<@${discordId}> ${message}`,
                })
            } else if (info.announcement === true && channelId !== undefined) {
                const guild = await client.guilds.fetch(guildId)
                channel = await channelService.getChannelFromDiscordAPI(guild, channelId)
                const user = await guild.members.fetch(discordId)
                threadName = `Private Message for ${user.user.username}`
                if (channel !== null && channel.type === 0) {
                    await createPrivateThreadAndSendMessage(channel, {
                        threadName,
                        message: `<@${discordId}> ${message}`,
                    })
                }
            }
        }
    }
}

export default {
    sendDirectMessage,
}
