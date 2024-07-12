import { type Connection } from 'mongoose';
import { type IGuildMember, type IGuildMemberMethods, type IGuildMemberUpdateBody } from '@togethercrew.dev/db';
import { type GuildMember } from 'discord.js';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ module: 'GuildMemberService' });
/**
 * Create a guild member in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IGuildMember} guildMember - The guild member object to be created.
 * @returns {Promise<IGuildMember|null>} - A promise that resolves to the created guild member object.
 */
async function createGuildMember(connection: Connection, guildMember: IGuildMember): Promise<IGuildMember | null> {
  try {
    return await connection.models.GuildMember.create(guildMember);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // if (error.code === 11000) {
    // logger.warn(
    //   { database: connection.name, guild_member_id: guildMember.discordId },
    //   'Failed to create duplicate guild member',
    // );
    //   return null;
    // }
    // logger.error(
    //   {
    //     database: connection.name,
    //     guild_member_id: guildMember.discordId,
    //     error,
    //   },
    //   'Failed to create guild member',
    // );
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
    return await connection.models.GuildMember.insertMany(guildMembers, {
      ordered: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // if (error.code === 11000) {
    //   logger.warn({ database: connection.name }, 'Failed to create duplicate guild members');
    //   return [];
    // }
    // logger.error({ database: connection.name, error }, 'Failed to create guild members');
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
  filter: object,
): Promise<(IGuildMember & IGuildMemberMethods) | null> {
  return await connection.models.GuildMember.findOne(filter);
}

/**
 * Get guild members from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entries.
 * @returns {Promise<IGuildMember[] | []>} - A promise that resolves to an array of the matching guild member objects.
 */
async function getGuildMembers(connection: Connection, filter: object): Promise<IGuildMember[] | []> {
  return await connection.models.GuildMember.find(filter);
}

/**
 * Update a guild member in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry.
 * @param {IGuildMemberUpdateBody} updateBody - An object containing the updated guild member data.
 * @returns {Promise<IGuildMember | null>} - A promise that resolves to the updated guild member object or null if not found.
 */
async function updateGuildMember(
  connection: Connection,
  filter: object,
  updateBody: IGuildMemberUpdateBody,
): Promise<IGuildMember | null> {
  try {
    const guildMember = await connection.models.GuildMember.findOne(filter);
    if (guildMember === null) {
      return null;
    }
    Object.assign(guildMember, updateBody);
    await guildMember.save();
    return guildMember;
  } catch (error) {
    logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update guild member');
    return null;
  }
}

/**
 * Update multiple guild members in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple guild member entries.
 * @param {IGuildMemberUpdateBody} updateBody - An object containing the updated guild member data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated guild member entries.
 */
async function updateGuildMembers(
  connection: Connection,
  filter: object,
  updateBody: IGuildMemberUpdateBody,
): Promise<number> {
  try {
    const updateResult = await connection.models.GuildMember.updateMany(filter, updateBody);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return updateResult.modifiedCount || 0;
  } catch (error) {
    logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update guild members');
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
    logger.error({ database: connection.name, filter, error }, 'Failed to delete guild member');
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
    logger.error({ database: connection.name, filter, error }, 'Failed to delete guild members');
    return 0;
  }
}

/**
 * Handle the logic for creating or updating guild members in the database.
 * @param {Connection} connection - Mongoose connection object for the specific guild database.
 * @param {GuildMember} guildMember - The Discord.js GuildMember object containing the member details.
 * @returns {Promise<void>} - A promise that resolves when the create or update operation is complete.
 *
 */
async function handelGuildMemberChanges(connection: Connection, guildMember: GuildMember): Promise<void> {
  const commonFields = getNeededDateFromGuildMember(guildMember);
  try {
    const guildMemberDoc = await updateGuildMember(connection, { discordId: guildMember.user.id }, commonFields);
    if (guildMemberDoc === null) {
      await createGuildMember(connection, {
        ...commonFields,
        isBot: guildMember.user.bot,
      });
    }
  } catch (error) {
    logger.error(
      { guild_id: connection.name, guild_member_id: guildMember.id, error },
      'Failed to handle guild member changes',
    );
  }
}

/**
 * Extracts necessary fields from a Discord.js GuildMember object to form an IGuildMember object.
 * @param {GuildMember} guildMember - The Discord.js GuildMember object containing the full member details.
 * @returns {IGuildMember} - An object that adheres to the IGuildMember interface, containing selected fields from the provided guild member.
 */
function getNeededDateFromGuildMember(guildMember: GuildMember): IGuildMember {
  return {
    discordId: guildMember.user.id,
    username: guildMember.user.username,
    avatar: guildMember.user.avatar,
    joinedAt: guildMember.joinedAt,
    // roles: guildMember.roles.cache.map((role) => role.id),
    roles: [],
    discriminator: guildMember.user.discriminator,
    permissions: guildMember.permissions.bitfield.toString(),
    nickname: guildMember.nickname,
    globalName: guildMember.user.globalName,
    isBot: guildMember.user.bot,
  };
}

/**
 * Retrieves the oldest guildMember object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getLatestGuildMember(connection: Connection, filter: object): Promise<IGuildMember | null> {
  return await connection.models.GuildMember.findOne(filter).sort({
    _id: -1,
  });
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
  handelGuildMemberChanges,
  getNeededDateFromGuildMember,
  getLatestGuildMember,
};
