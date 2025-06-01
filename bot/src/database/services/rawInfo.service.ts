import { Connection } from 'mongoose'
import { Message, Role, Snowflake, TextChannel, User } from 'discord.js'
import fetch from 'node-fetch'

import { IRawInfo, IRawInfoUpdateBody, IDiscordUser } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import config from '../../config'

const logger = parentLogger.child({ module: 'rawInfoService' })

/**
 * Interface for thread information.
 */
interface ThreadInfo {
    threadId: Snowflake
    threadName: string
    channelId: Snowflake | undefined
    channelName: string | undefined
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
            logger.warn(
                { channel_id: channelId, message_id: messageId },
                `Rate limited for emoji: ${encodedEmoji}. Retrying after ${rateLimitInfo.retry_after} seconds.`
            )
            await new Promise((resolve) => setTimeout(resolve, retryAfter))
            continue
        } else {
            const errorText = await response.text()
            logger.error({ channelId, messageId, errorText }, 'Error fetching users for reaction')
            hasMore = false
        }
    }
    return users
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

            const users = await fetchAllUsersForReaction(channelId, messageId, encodedEmoji)
            const usersString = users.map((user) => `${user.id}`).join(',')
            reactionsArr.push(`${usersString},${emoji.name}`)
        }

        return reactionsArr
    } catch (error) {
        // logger.error({ message_id: message.id, error }, 'Failed to get reactions');
        return []
    }
}

/**
 * Extracts necessary data from a given message.
 * @param {Message} message - The message object from which data is to be extracted.
 * @param {ThreadInfo} threadInfo - An optional thread info object containing details about the thread the message is part of.
 * @returns {Promise<IRawInfo>} - A promise that resolves to an object of type IRawInfo containing the extracted data.
 */
async function getNeedDataFromMessage(message: Message, threadInfo?: ThreadInfo): Promise<IRawInfo> {
    if (threadInfo) {
        return {
            type: message.type,
            author: message.author.id,
            content: message.content,
            createdDate: message.createdAt,
            role_mentions: message.mentions.roles.map((role: Role) => role.id),
            user_mentions: message.mentions.users.map((user: User) => user.id),
            replied_user: message.type === 19 ? message.mentions.repliedUser?.id : null,
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
            replied_user: message.type === 19 ? message.mentions.repliedUser?.id : null,
            reactions: await getReactions(message),
            messageId: message.id,
            channelId: message.channelId,
            channelName: message.channel instanceof TextChannel ? message.channel.name : null,
            threadId: null,
            threadName: null,
            isGeneratedByWebhook: message.webhookId ? true : false,
        }
    }
}

/**
 * Create a rawInfo entry in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo} rawInfo - The rawInfo object to be created.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the created rawInfo object.
 */
async function createRawInfo(connection: Connection, rawInfo: IRawInfo): Promise<IRawInfo | null> {
    try {
        return await connection.models.RawInfo.create(rawInfo)
    } catch (error) {
        return null
    }
}

/**
 * Create multiple rawInfo entries in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} rawInfos - An array of rawInfo objects to be created.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the created rawInfo objects.
 */
async function createRawInfos(connection: Connection, rawInfos: IRawInfo[]): Promise<IRawInfo[] | []> {
    try {
        return await connection.models.RawInfo.insertMany(rawInfos, {
            ordered: false,
        })
    } catch (error) {
        logger.error({ database: connection.name, error }, 'Failed to create rawInfos')
        return []
    }
}

/**
 * Get a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the matching rawInfo object or null if not found.
 */
async function getRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
    return await connection.models.RawInfo.findOne(filter)
}

/**
 * Get rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entries.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the matching rawInfo objects.
 */
async function getRawInfos(connection: Connection, filter: object): Promise<IRawInfo[] | []> {
    return await connection.models.RawInfo.find(filter)
}

/**
 * Update a rawInfo entry in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @param {IRawInfo} updateBody - An object containing the updated rawInfo data.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the updated rawInfo object or null if not found.
 */
async function updateRawInfo(connection: Connection, filter: object, updateBody: any): Promise<IRawInfo | null> {
    try {
        const rawInfo = await connection.models.RawInfo.findOne(filter)
        if (rawInfo === null) {
            return null
        }
        Object.assign(rawInfo, updateBody)
        await rawInfo.save()
        return rawInfo
    } catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update rawInfo')
        return null
    }
}

/**
 * Update multiple rawInfo entries in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple rawInfo entries.
 * @param {IRawInfo} updateBody - An object containing the updated rawInfo data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated rawInfo entries.
 */
async function updateManyRawInfo(
    connection: Connection,
    filter: object,
    updateBody: IRawInfoUpdateBody
): Promise<number> {
    try {
        const updateResult = await connection.models.RawInfo.updateMany(filter, updateBody)
        return updateResult.modifiedCount || 0
    } catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update rawInfos')
        return 0
    }
}

/**
 * Delete a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the rawInfo entry was successfully deleted, or false otherwise.
 */
async function deleteRawInfo(connection: Connection, filter: object): Promise<boolean> {
    try {
        const deleteResult = await connection.models.RawInfo.deleteOne(filter)
        return deleteResult.deletedCount === 1
    } catch (error) {
        logger.error({ database: connection.name, filter, error }, 'Failed to delete rawInfo')
        return false
    }
}

/**
 * Delete multiple rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple rawInfo entries for deletion.
 * @returns {Promise<number>} - A promise that resolves to the number of deleted rawInfo entries.
 * @throws {Error} - If there is an error while deleting the rawInfo entries.
 */
async function deleteManyRawInfo(connection: Connection, filter: object): Promise<number> {
    try {
        const deleteResult = await connection.models.RawInfo.deleteMany(filter)
        return deleteResult.deletedCount
    } catch (error) {
        logger.error({ database: connection.name, filter, error }, 'Failed to delete rawInfos')
        return 0
    }
}


/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getNewestRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
    return await connection.models.RawInfo.findOne(filter).sort({
        createdDate: -1,
    })
}

/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getOldestRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
    return await connection.models.RawInfo.findOne(filter).sort({
        createdDate: 1,
    })
}

export default {
    createRawInfo,
    createRawInfos,
    updateRawInfo,
    updateManyRawInfo,
    deleteRawInfo,
    deleteManyRawInfo,
    getRawInfo,
    getRawInfos,
    getNewestRawInfo,
    getOldestRawInfo,
    getNeedDataFromMessage,
    getReactions,
    fetchAllUsersForReaction,
}
