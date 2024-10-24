/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import fetch from 'node-fetch'
import {
    type Message,
    TextChannel,
    type User,
    type Role,
    ThreadChannel,
    type Snowflake,
} from 'discord.js'
import {
    type IRawInfo,
    type IPlatform,
    type IDiscordUser,
} from '@togethercrew.dev/db'
import { rawInfoService, platformService } from '../database/services'
import { type Connection, type HydratedDocument } from 'mongoose'
import { guildService, channelService } from '../services'
import config from '../config'
import parentLogger from '../config/logger'

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
 * Fetches reaction details from a message.
 * @param {Message} message - The message object from which reactions are to be fetched.
 * @returns {Promise<string[]>} - A promise that resolves to an array of strings where each string is a comma-separated list of user IDs who reacted followed by the reaction emoji.
 */
async function getReactions(message: Message): Promise<string[]> {
    try {
        const channelId = message.channel.id
        const messageId = message.id
        const reactions = message.reactions.cache
        const reactionsArray = [...reactions.values()]
        const reactionsArr = []

        for (const reaction of reactionsArray) {
            const emoji = reaction.emoji
            let encodedEmoji

            if (emoji.id) {
                // Custom emoji: encode as name:id
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                encodedEmoji = encodeURIComponent(`${emoji.name}:${emoji.id}`)
            } else if (emoji.name) {
                encodedEmoji = encodeURIComponent(emoji.name)
            } else {
                logger.error(
                    {
                        guild_id: message.guildId,
                        channle_id: channelId,
                        message_id: message.id,
                        emoji,
                    },
                    'Emoji name is null or undefined.'
                )

                continue
            }

            const users = await fetchAllUsersForReaction(
                channelId,
                messageId,
                encodedEmoji
            )
            const usersString = users.map((user) => `${user.id}`).join(',')
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            reactionsArr.push(`${usersString},${emoji.name}`)
        }

        return reactionsArr
    } catch (error) {
        // logger.error({ message_id: message.id, error }, 'Failed to get reactions');
        return []
    }
}

/**
 * Fetches all users who reacted with a specific emoji on a message using pagination.
 * @param {string} channelId - The ID of the channel containing the message.
 * @param {string} messageId - The ID of the message containing the reactions.
 * @param {string} encodedEmoji - The URL-encoded emoji string.
 * @returns {Promise<IDiscordUser[]>} - A promise that resolves to an array of user objects.
 */
async function fetchAllUsersForReaction(
    channelId: string,
    messageId: string,
    encodedEmoji: string
): Promise<IDiscordUser[]> {
    let users: IDiscordUser[] = []
    let after = ''
    const limit = 100
    let hasMore = true

    while (hasMore) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}?limit=${limit}${
            after ? `&after=${after}` : ''
        }`
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                Authorization: `Bot ${config.discord.botToken}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const fetchedUsers = await response.json()
            users = users.concat(fetchedUsers)
            if (fetchedUsers.length < limit) {
                hasMore = false
            } else {
                after = fetchedUsers[fetchedUsers.length - 1].id
            }
        } else if (response.status === 429) {
            const rateLimitInfo = await response.json()
            const retryAfter = rateLimitInfo.retry_after * 1000
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            logger.warn(
                { channel_id: channelId, message_id: messageId },
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `Rate limited for emoji: ${encodedEmoji}. Retrying after ${rateLimitInfo.retry_after} seconds.`
            )
            await new Promise((resolve) => setTimeout(resolve, retryAfter))
            continue
        } else {
            const errorText = await response.text()
            logger.error(
                { channelId, messageId, errorText },
                'Error fetching users for reaction'
            )
            hasMore = false
        }
    }
    return users
}

/**
 * Extracts necessary data from a given message.
 * @param {Message} message - The message object from which data is to be extracted.
 * @param {threadInfo} threadInfo - An optional thread info object containing details about the thread the message is part of.
 * @returns {Promise<IRawInfo>} - A promise that resolves to an object of type IRawInfo containing the extracted data.
 */
async function getNeedDataFromMessage(
    message: Message,
    threadInfo?: threadInfo
): Promise<IRawInfo> {
    if (threadInfo) {
        return {
            type: message.type,
            author: message.author.id,
            content: message.content,
            createdDate: message.createdAt,
            role_mentions: message.mentions.roles.map((role: Role) => role.id),
            user_mentions: message.mentions.users.map((user: User) => user.id),
            replied_user:
                message.type === 19 ? message.mentions.repliedUser?.id : null,
            reactions: await getReactions(message),
            messageId: message.id,
            channelId: threadInfo?.channelId ? threadInfo?.channelId : '',
            channelName: threadInfo?.channelName ? threadInfo?.channelName : '',
            threadId: threadInfo?.threadId ? threadInfo?.threadId : null,
            threadName: threadInfo?.threadName ? threadInfo?.threadName : null,
            isGeneratedByWebhook: message.webhookId ? true : false,
        }
    } else {
        return {
            type: message.type,
            author: message.author.id,
            content: message.content,
            createdDate: message.createdAt,
            role_mentions: message.mentions.roles.map((role: Role) => role.id),
            user_mentions: message.mentions.users.map((user: User) => user.id),
            replied_user:
                message.type === 19 ? message.mentions.repliedUser?.id : null,
            reactions: await getReactions(message),
            messageId: message.id,
            channelId: message.channelId,
            channelName:
                message.channel instanceof TextChannel
                    ? message.channel.name
                    : null,
            threadId: null,
            threadName: null,
            isGeneratedByWebhook: message.webhookId ? true : false,
        }
    }
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
            arr.push(await getNeedDataFromMessage(message, threadInfo))
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
            const boundaryMessage =
                fetchDirection === 'before'
                    ? fetchedMessages.last()
                    : fetchedMessages.first()
            if (
                !boundaryMessage ||
                (period && boundaryMessage.createdAt < period)
            ) {
                if (period) {
                    fetchedMessages = fetchedMessages.filter(
                        (msg) => msg.createdAt > period
                    )
                }
                channel instanceof ThreadChannel
                    ? await pushMessagesToArray(
                          connection,
                          messagesToStore,
                          [...fetchedMessages.values()],
                          {
                              threadId: channel.id,
                              threadName: channel.name,
                              channelId: channel.parent?.id,
                              channelName: channel.parent?.name,
                          }
                      )
                    : await pushMessagesToArray(connection, messagesToStore, [
                          ...fetchedMessages.values(),
                      ])
                break
            }
            channel instanceof ThreadChannel
                ? await pushMessagesToArray(
                      connection,
                      messagesToStore,
                      [...fetchedMessages.values()],
                      {
                          threadId: channel.id,
                          threadName: channel.name,
                          channelId: channel.parent?.id,
                          channelName: channel.parent?.name,
                      }
                  )
                : await pushMessagesToArray(connection, messagesToStore, [
                      ...fetchedMessages.values(),
                  ])
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
async function handleFetchChannelMessages(
    connection: Connection,
    channel: TextChannel,
    period: Date
) {
    // logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle channel messages for channel is running');
    try {
        const oldestChannelRawInfo = await rawInfoService.getOldestRawInfo(
            connection,
            {
                channelId: channel?.id,
                threadId: null,
            }
        )
        const newestChannelRawInfo = await rawInfoService.getNewestRawInfo(
            connection,
            {
                channelId: channel?.id,
                threadId: null,
            }
        )
        if (oldestChannelRawInfo && oldestChannelRawInfo.createdDate > period) {
            await fetchMessages(
                connection,
                channel,
                oldestChannelRawInfo,
                period,
                'before'
            )
        }
        if (newestChannelRawInfo) {
            await fetchMessages(
                connection,
                channel,
                newestChannelRawInfo,
                period,
                'after'
            )
        }

        if (!newestChannelRawInfo && !oldestChannelRawInfo) {
            await fetchMessages(
                connection,
                channel,
                undefined,
                period,
                'before'
            )
        }

        const threads = channel.threads.cache.values()

        for (const thread of threads) {
            const oldestThreadRawInfo = await rawInfoService.getOldestRawInfo(
                connection,
                {
                    channelId: channel?.id,
                    threadId: thread.id,
                }
            )
            const newestThreadRawInfo = await rawInfoService.getNewestRawInfo(
                connection,
                {
                    channelId: channel?.id,
                    threadId: thread.id,
                }
            )

            if (
                oldestThreadRawInfo &&
                oldestThreadRawInfo.createdDate > period
            ) {
                await fetchMessages(
                    connection,
                    thread,
                    oldestThreadRawInfo,
                    period,
                    'before'
                )
            }

            if (newestThreadRawInfo) {
                await fetchMessages(
                    connection,
                    thread,
                    newestThreadRawInfo,
                    period,
                    'after'
                )
            }

            if (!newestThreadRawInfo && !oldestThreadRawInfo) {
                await fetchMessages(
                    connection,
                    thread,
                    undefined,
                    period,
                    'before'
                )
            }
        }
    } catch (err) {
        logger.error(
            { guild_id: connection.name, channel_id: channel.id, err },
            'Handle fetch channel messages failed'
        )
    }
    // logger.info({ guild_id: connection.name, channel_id: channel.id }, 'Handle fetch channel messages is done');
}

export default async function handleFetchMessages(
    connection: Connection,
    platform: HydratedDocument<IPlatform>
) {
    try {
        const guild = await guildService.getGuildFromDiscordAPI(
            platform.metadata?.id
        )
        if (guild) {
            if (
                platform.metadata?.selectedChannels &&
                platform.metadata?.period
            ) {
                await platformService.updatePlatform(
                    { _id: platform.id },
                    { metadata: { isInProgress: true } }
                )
                for (
                    let i = 0;
                    i < platform.metadata?.selectedChannels.length;
                    i++
                ) {
                    const channel =
                        await channelService.getChannelFromDiscordAPI(
                            guild,
                            platform.metadata?.selectedChannels[i]
                        )
                    if (channel) {
                        if (channel.type !== 0) continue
                        await handleFetchChannelMessages(
                            connection,
                            channel,
                            platform.metadata?.period
                        )
                    }
                }
            }
        }
    } catch (error) {
        logger.error(
            { guild_id: platform.metadata?.id, error },
            'Failed to fetch messages'
        )
    }
}
