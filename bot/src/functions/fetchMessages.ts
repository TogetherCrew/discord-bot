import { Message, Snowflake, TextChannel, ThreadChannel } from 'discord.js'
import { Connection, HydratedDocument } from 'mongoose'

import { IPlatform, IRawInfo } from '@togethercrew.dev/db'

import parentLogger from '../config/logger'
import { platformService, rawInfoService } from '../database/services'
import { channelService, guildService } from '../services'
import { sanitizeRawInfoForIgnoredUsers } from '../utils/guildIgnoredUsers'

const logger = parentLogger.child({ module: 'FetchMessages' })
interface threadInfo {
    threadId: Snowflake
    threadName: string
    channelId: Snowflake | undefined
    channelName: string | undefined
}

interface FetchOptions {
    limit: number
    before?: Snowflake
    after?: Snowflake
}

/**
 * Iterates over a list of messages and pushes extracted data from each message to an array.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
 * @param {Message[]} messagesArray - An array of messages from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the messages are part of.
 * @returns {Promise<IRawInfo[]>} - A promise that resolves to the updated array containing the extracted data.
 */
async function pushMessagesToArray(
    connection: Connection,
    arr: IRawInfo[],
    messagesArray: Message[],
    threadInfo?: threadInfo
): Promise<IRawInfo[]> {
    const allowedTypes: number[] = [0, 18, 19]
    for (const message of messagesArray) {
        if (message.type === 21) {
            // const res = await rawInfoService.updateRawInfo(connection, { messageId: message.id }, { threadId: threadInfo?.threadId, threadName: threadInfo?.threadName });
        }

        if (allowedTypes.includes(message.type)) {
            arr.push(await rawInfoService.getNeedDataFromMessage(message, threadInfo))
        }
    }
    return arr
}

/**
 * Fetches a list of messages from a specified channel and stores their extracted data.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {TextChannel | ThreadChannel} channel - The channel from which messages are to be fetched.
 * @param {IRawInfo} rawInfo - An optional raw info object used for message fetching options.
 * @param {Date} period - A date object specifying the oldest date for the messages to be fetched.
 * @param {'before' | 'after'} fetchDirection - The direction of message fetching: 'before' fetches older messages and 'after' fetches newer messages.
 * @throws Will throw an error if an issue is encountered during processing.
 */
async function fetchMessages(
    connection: Connection,
    channel: TextChannel | ThreadChannel,
    rawInfo: IRawInfo | undefined = undefined,
    period: Date,
    fetchDirection: 'before' | 'after' = 'before'
) {
    try {
        // logger.info(
        //   { guild_id: connection.name, channel_id: channel.id, fetchDirection },
        //   'Fetching channel messages is running',
        // );
        const messagesToStore: IRawInfo[] = []
        const options: FetchOptions = { limit: 100 }
        period = new Date(period)
        if (rawInfo) {
            options[fetchDirection] = rawInfo.messageId
        }
        let fetchedMessages = await channel.messages.fetch(options)

        while (fetchedMessages.size > 0) {
            const boundaryMessage = fetchDirection === 'before' ? fetchedMessages.last() : fetchedMessages.first()
            if (!boundaryMessage || (period && boundaryMessage.createdAt < period)) {
                if (period) {
                    fetchedMessages = fetchedMessages.filter((msg) => msg.createdAt > period)
                }
                channel instanceof ThreadChannel
                    ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
                          threadId: channel.id,
                          threadName: channel.name,
                          channelId: channel.parent?.id,
                          channelName: channel.parent?.name,
                      })
                    : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()])
                break
            }
            channel instanceof ThreadChannel
                ? await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()], {
                      threadId: channel.id,
                      threadName: channel.name,
                      channelId: channel.parent?.id,
                      channelName: channel.parent?.name,
                  })
                : await pushMessagesToArray(connection, messagesToStore, [...fetchedMessages.values()])
            await rawInfoService.createRawInfos(connection, messagesToStore)
            options[fetchDirection] = boundaryMessage.id
            fetchedMessages = await channel.messages.fetch(options)
        }
    } catch (err) {
        logger.error(
            {
                guild_id: connection.name,
                channel_id: channel.id,
                fetchDirection,
                err,
            },
            'Fetching channel messages failed'
        )
    }
    // logger.info(
    //   { guild_id: connection.name, channel_id: channel.id, fetchDirection },
    //   'Fetching channel messages is done',
    // );
}

/**
 * Fetches messages from a specified channel and its threads and stores their extracted data.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {TextChannel} channel - The channel from which messages are to be fetched.
 * @param {Date} period - A date object specifying the oldest date for the messages to be fetched.
 * @throws Will throw an error if an issue is encountered during processing.
 */
async function handleFetchChannelMessages(connection: Connection, channel: TextChannel, period: Date) {
    // logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle channel messages for channel is running');
    try {
        const oldestChannelRawInfo = await rawInfoService.getOldestRawInfo(connection, {
            channelId: channel?.id,
            threadId: null,
        })
        const newestChannelRawInfo = await rawInfoService.getNewestRawInfo(connection, {
            channelId: channel?.id,
            threadId: null,
        })
        if (oldestChannelRawInfo && oldestChannelRawInfo.createdDate > period) {
            await fetchMessages(connection, channel, oldestChannelRawInfo, period, 'before')
        }
        if (newestChannelRawInfo) {
            await fetchMessages(connection, channel, newestChannelRawInfo, period, 'after')
        }

        if (!newestChannelRawInfo && !oldestChannelRawInfo) {
            await fetchMessages(connection, channel, undefined, period, 'before')
        }

        const threads = channel.threads.cache.values()

        for (const thread of threads) {
            const oldestThreadRawInfo = await rawInfoService.getOldestRawInfo(connection, {
                channelId: channel?.id,
                threadId: thread.id,
            })
            const newestThreadRawInfo = await rawInfoService.getNewestRawInfo(connection, {
                channelId: channel?.id,
                threadId: thread.id,
            })

            if (oldestThreadRawInfo && oldestThreadRawInfo.createdDate > period) {
                await fetchMessages(connection, thread, oldestThreadRawInfo, period, 'before')
            }

            if (newestThreadRawInfo) {
                await fetchMessages(connection, thread, newestThreadRawInfo, period, 'after')
            }

            if (!newestThreadRawInfo && !oldestThreadRawInfo) {
                await fetchMessages(connection, thread, undefined, period, 'before')
            }
        }
    } catch (err) {
        logger.error({ guild_id: connection.name, channel_id: channel.id, err }, 'Handle fetch channel messages failed')
    }
    // logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle fetch channel messages is done');
}

export default async function handleFetchMessages(connection: Connection, platform: HydratedDocument<IPlatform>) {
    try {
        const guild = await guildService.getGuildFromDiscordAPI(platform.metadata?.id)
        if (guild) {
            if (platform.metadata?.selectedChannels && platform.metadata?.period) {
                await platformService.updatePlatform({ _id: platform.id }, { metadata: { isInProgress: true } })
                for (let i = 0; i < platform.metadata?.selectedChannels.length; i++) {
                    const channel = await channelService.getChannelFromDiscordAPI(
                        guild,
                        platform.metadata?.selectedChannels[i]
                    )
                    if (channel) {
                        if (channel.type !== 0) continue
                        await handleFetchChannelMessages(connection, channel, platform.metadata?.period)
                    }
                }
                sanitizeRawInfoForIgnoredUsers(guild.id)
            }
        }
    } catch (error) {
        logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch messages')
    }
}
