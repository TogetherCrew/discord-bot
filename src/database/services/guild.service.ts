import { Guild, IGuild, IGuildUpdateBody } from '@togethercrew.dev/db';
import { Snowflake, Client } from 'discord.js';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ module: 'GuildService' });

/**
 * get guild by query
 * @param {Object} filter
 * @returns {Promise<IGuild | null>}
 */
async function getGuild(filter: object): Promise<IGuild | null> {
  return Guild.findOne(filter);
}

/**
 * Retrieve and return multiple guild entries that match the provided filter.
 * @param {object} filter - Filter criteria to match the desired guild entries.
 * @returns {Promise<object[]>} - A promise that resolves to an array of matching guild entries.
 */
async function getGuilds(filter: object): Promise<IGuild[]> {
  return await Guild.find(filter);
}

/**
 * Update the guild entry that matches the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired guild entry for update.
 * @param {IGuildUpdateBody} updateBody - Updated information for the guild entry.
 * @returns {Promise<object|null>} - A promise that resolves to the updated guild entry, or null if not found.
 */
async function updateGuild(filter: object, updateBody: IGuildUpdateBody): Promise<IGuild | null> {
  try {
    const guild = await Guild.findOne(filter);
    if (!guild) {
      return null;
    }
    Object.assign(guild, updateBody);
    return await guild.save();
  } catch (error) {
    logger.error({ database: 'RnDAO', filter, updateBody, error }, 'Failed to update guild');
    return null;
  }
}

/**
 * Update multiple guild entries that match the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired guild entries for update.
 * @param {IGuildUpdateBody} updateBody - Updated information for the guild entry.
 * @returns {Promise<number>} - A promise that resolves to the number of guild entries updated.
 */
async function updateManyGuilds(filter: object, updateBody: IGuildUpdateBody): Promise<number> {
  try {
    const updateResult = await Guild.updateMany(filter, updateBody);
    const modifiedCount = updateResult.modifiedCount;
    return modifiedCount;
  } catch (error) {
    logger.error({ database: 'RnDAO', filter, updateBody, error }, 'Failed to update guilds');
    return 0;
  }
}

async function checkBotAccessToGuild(client: Client, guildId: Snowflake) {
  if (!client.guilds.cache.has(guildId)) {
    await updateGuild({ guildId }, { isDisconnected: false });
    return false;
  }
  return true;
}

export default {
  getGuild,
  getGuilds,
  updateGuild,
  updateManyGuilds,
  checkBotAccessToGuild,
};
