import { Connection } from 'mongoose';
import { IGuildMember, IGuildMemberMethods, IGuildMemberUpdateBody } from '@togethercrew.dev/db';

/**
 * Create a guild member in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IGuildMember} guildMember - The guild member object to be created.
 * @returns {Promise<IGuildMember|null>} - A promise that resolves to the created guild member object.
 */
async function createGuildMember(connection: Connection, guildMember: IGuildMember): Promise<IGuildMember | null> {
  try {
    return await connection.models.GuildMember.create(guildMember);
  } catch (error) {
    console.log('Failed to create guild member', error);
    return null;
  }
}

/**
 * Create guild members in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IGuildMember[]} guildMembers - An array of guild member objects to be created.
 * @returns {Promise<IGuildMember[] | []>} - A promise that resolves to an array of the created guild member objects.
 */
async function createGuildMembers(connection: Connection, guildMembers: IGuildMember[]): Promise<IGuildMember[] | []> {
  try {
    return await connection.models.GuildMember.insertMany(guildMembers, { ordered: false });
  } catch (error) {
    console.log('Failed to create guild members', error);
    return [];
  }
}

/**
 * Get a guild member from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry.
 * @returns {Promise<IGuildMember | null>} - A promise that resolves to the matching guild member object or null if not found.
 */
async function getGuildMember(
  connection: Connection,
  filter: object
): Promise<(IGuildMember & IGuildMemberMethods) | null> {
  try {
    return await connection.models.GuildMember.findOne(filter);
  } catch (error) {
    console.log('Failed to retrieve  guild member', error);
    return null;
  }
}

/**
 * Get guild members from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entries.
 * @returns {Promise<IGuildMember[] | []>} - A promise that resolves to an array of the matching guild member objects.
 */
async function getGuildMembers(connection: Connection, filter: object): Promise<IGuildMember[] | []> {
  try {
    return await connection.models.GuildMember.find(filter);
  } catch (error) {
    console.log('Failed to retrieve  guild members', error);
    return [];
  }
}

/**
 * Update a guild member in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry.
 * @param {IGuildMemberUpdateBody} UpdateBody - An object containing the updated guild member data.
 * @returns {Promise<IGuildMember | null>} - A promise that resolves to the updated guild member object or null if not found.
 */
async function updateGuildMember(
  connection: Connection,
  filter: object,
  UpdateBody: IGuildMemberUpdateBody
): Promise<IGuildMember | null> {
  try {
    const guildMember = await connection.models.GuildMember.findOne(filter);
    if (!guildMember) {
      return null;
    }
    Object.assign(guildMember, UpdateBody);
    return await guildMember.save();
  } catch (error) {
    console.log('Failed to update guild member', error);
    return null;
  }
}

/**
 * Update multiple guild members in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple guild member entries.
 * @param {IGuildMemberUpdateBody} UpdateBody - An object containing the updated guild member data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated guild member entries.
 */
async function updateGuildMembers(
  connection: Connection,
  filter: object,
  UpdateBody: IGuildMemberUpdateBody
): Promise<number> {
  try {
    const updateResult = await connection.models.GuildMember.updateMany(filter, UpdateBody);
    return updateResult.modifiedCount || 0;
  } catch (error) {
    console.log('Failed to update guild members', error);
    return 0;
  }
}

/**
 * Delete a guild member from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the guild member was successfully deleted, or false otherwise.
 */
async function deleteGuildMember(connection: Connection, filter: object): Promise<boolean> {
  try {
    const deleteResult = await connection.models.GuildMember.deleteOne(filter);
    return deleteResult.deletedCount === 1;
  } catch (error) {
    console.log('Failed to delete guild member', error);
    return false;
  }
}

/**
 * Delete multiple guild members from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple guild member entries for deletion.
 * @returns {Promise<number>} - A promise that resolves to the number of deleted guild member entries.
 */
async function deleteGuildMembers(connection: Connection, filter: object): Promise<number> {
  try {
    const deleteResult = await connection.models.GuildMember.deleteMany(filter);
    return deleteResult.deletedCount;
  } catch (error) {
    console.log('Failed to delete guild members', error);
    return 0;
  }
}

export default {
  createGuildMember,
  createGuildMembers,
  updateGuildMember,
  getGuildMember,
  getGuildMembers,
  updateGuildMembers,
  deleteGuildMember,
  deleteGuildMembers,
};
