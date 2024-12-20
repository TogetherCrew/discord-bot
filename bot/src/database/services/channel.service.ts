/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { type Connection } from 'mongoose'
import { type IChannel, type IChannelMethods, type IChannelUpdateBody } from '@togethercrew.dev/db'
import { type VoiceChannel, type TextChannel, type CategoryChannel } from 'discord.js'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ module: 'ChannelService' })

/**
 * Create a channel in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IChannel} channel - The channel object to be created.
 * @returns {Promise<IChannel|null>} - A promise that resolves to the created channel object.
 */
async function createChannel(connection: Connection, channel: IChannel): Promise<IChannel | null> {
    try {
        return await connection.models.Channel.create(channel)
    } catch (error) {
        return null
    }
}

/**
 * Create channels in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IChannel[]} channels - An array of channel objects to be created.
 * @returns {Promise<IChannel[] | []>} - A promise that resolves to an array of the created channel objects.
 */
async function createChannels(connection: Connection, channels: IChannel[]): Promise<IChannel[] | []> {
    try {
        return await connection.models.Channel.insertMany(channels, {
            ordered: false,
        })
    } catch (error) {
        return []
    }
}

/**
 * Get a channel from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entry.
 * @returns {Promise<IChannel | null>} - A promise that resolves to the matching channel object or null if not found.
 */
async function getChannel(connection: Connection, filter: object): Promise<(IChannel & IChannelMethods) | null> {
    return await connection.models.Channel.findOne(filter)
}

/**
 * Get channels from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entries.
 * @returns {Promise<IChannel[] | []>} - A promise that resolves to an array of the matching channel objects.
 */
async function getChannels(connection: Connection, filter: object): Promise<IChannel[] | []> {
    return await connection.models.Channel.find(filter)
}

/**
 * Update a channel in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entry.
 * @param {IChannelUpdateBody} updateBody - An object containing the updated channel data.
 * @returns {Promise<IChannel | null>} - A promise that resolves to the updated channel object or null if not found.
 */
async function updateChannel(
    connection: Connection,
    filter: object,
    updateBody: IChannelUpdateBody
): Promise<IChannel | null> {
    try {
        const channel = await connection.models.Channel.findOne(filter)
        if (channel === null) {
            return null
        }
        Object.assign(channel, updateBody)
        await channel.save()
        return channel
    } catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update channel')
        return null
    }
}

/**
 * Update multiple channels in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple channel entries.
 * @param {IChannelUpdateBody} updateBody - An object containing the updated channel data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated channel entries.
 */
async function updateChannels(connection: Connection, filter: object, updateBody: IChannelUpdateBody): Promise<number> {
    try {
        const updateResult = await connection.models.Channel.updateMany(filter, updateBody)
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return updateResult.modifiedCount || 0
    } catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update channels')
        return 0
    }
}

/**
 * Handle the logic for creating or updating channels in the database.
 * @param {Connection} connection - Mongoose connection object for the specific guild database.
 * @param {TextChannel | VoiceChannel | CategoryChannel} channel - The Discord.js Channel object containing the full channel details.
 * @returns {Promise<void>} - A promise that resolves when the create or update operation is complete.
 *
 */
async function handelChannelChanges(
    connection: Connection,
    channel: TextChannel | VoiceChannel | CategoryChannel
): Promise<void> {
    const commonFields = getNeededDateFromChannel(channel)
    try {
        const channelDoc = await updateChannel(connection, { channelId: channel.id }, commonFields)
        if (!channelDoc) {
            await createChannel(connection, commonFields)
        }
    } catch (error) {
        logger.error({ guild_id: connection.name, channel_id: channel.id, error }, 'Failed to handle channel changes')
    }
}

/**
 * Extracts necessary fields from a Discord.js GuildMember object to form an IGuildMember object.
 * @param {TextChannel | VoiceChannel | CategoryChannel} channel - The Discord.js Channel object containing the full channel details.
 * @returns {IChannel} - The extracted data in the form of an IChannel object.
 */
function getNeededDateFromChannel(channel: TextChannel | VoiceChannel | CategoryChannel): IChannel {
    return {
        channelId: channel.id,
        name: channel.name, // cast to TextChannel for 'name'
        parentId: channel.parentId,
        permissionOverwrites: Array.from(channel.permissionOverwrites.cache.values()).map((overwrite) => ({
            id: overwrite.id,
            type: overwrite.type,
            allow: overwrite.allow.bitfield.toString(),
            deny: overwrite.deny.bitfield.toString(),
        })),
        type: channel.type,
    }
}

export default {
    createChannel,
    createChannels,
    updateChannel,
    getChannel,
    getChannels,
    updateChannels,
    handelChannelChanges,
    getNeededDateFromChannel,
}
