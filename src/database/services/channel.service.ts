import { Connection, QueryOptions } from 'mongoose';
import { IChannel, IChannelMethods, IChannelUpdateBody } from '@togethercrew.dev/db';

/**
 * Create a channel in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IChannel} channel - The channel object to be created.
 * @returns {Promise<IChannel|null>} - A promise that resolves to the created channel object.
 */
async function createChannel(connection: Connection, channel: IChannel): Promise<IChannel | null> {
  try {
    return await connection.models.Channel.create(channel);
  } catch (error) {
    console.log('Failed to create channel', error);
    return null;
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
    return await connection.models.Channel.insertMany(channels, { ordered: false });
  } catch (error) {
    console.log('Failed to create channels', error);
    return [];
  }
}

/**
 * Get a channel from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entry.
 * @returns {Promise<IChannel | null>} - A promise that resolves to the matching channel object or null if not found.
 */
async function getChannel(connection: Connection, filter: object): Promise<(IChannel & IChannelMethods) | null> {
  try {
    return await connection.models.Channel.findOne(filter);
  } catch (error) {
    console.log('Failed to retrieve channel', error);
    return null;
  }
}

/**
 * Get channels from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entries.
 * @returns {Promise<IChannel[] | []>} - A promise that resolves to an array of the matching channel objects.
 */
async function getChannels(connection: Connection, filter: object): Promise<IChannel[] | []> {
  try {
    return await connection.models.Channel.find(filter);
  } catch (error) {
    console.log('Failed to retrieve channels', error);
    return [];
  }
}

/**
 * Update a channel in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entry.
 * @param {IChannelUpdateBody} UpdateBody - An object containing the updated channel data.
 * @returns {Promise<IChannel | null>} - A promise that resolves to the updated channel object or null if not found.
 */
async function findOneChannelAndUpdate(
  connection: Connection,
  filter: object,
  UpdateBody: IChannelUpdateBody
): Promise<IChannel | null> {
  try {
    const channel = await connection.models.Channel.findOne(filter);
    if (!channel) {
      return null;
    }
    Object.assign(channel, UpdateBody);
    return await channel.save();
  } catch (error) {
    console.log('Failed to findOne channel and update', error);
    return null;
  }
}

/**
 * Update a channel in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired channel entry.
 * @param {IChannelUpdateBody} UpdateBody - An object containing the updated channel data.
 * @param {QueryOptions} options - An object containing the update option.
 * @returns {Promise<IChannel | null>} - A promise that resolves to the updated channel object or null if not found.
 */
async function updateChannel(
  connection: Connection,
  filter: object,
  UpdateBody: IChannelUpdateBody,
  options: QueryOptions
) {
  try {
    const channel = await connection.models.Channel.updateOne(filter, UpdateBody, options);
    return channel;
  } catch (error) {
    console.log('Failed to update channel', error);
    return null;
  }
}

/**
 * Update multiple channels in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple channel entries.
 * @param {IChannelUpdateBody} UpdateBody - An object containing the updated channel data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated channel entries.
 */
async function updateChannels(connection: Connection, filter: object, UpdateBody: IChannelUpdateBody): Promise<number> {
  try {
    const updateResult = await connection.models.Channel.updateMany(filter, UpdateBody);
    return updateResult.modifiedCount || 0;
  } catch (error) {
    console.log('Failed to update channels', error);
    return 0;
  }
}

export default {
  createChannel,
  createChannels,
  findOneChannelAndUpdate,
  updateChannel,
  getChannel,
  getChannels,
  updateChannels,
};
