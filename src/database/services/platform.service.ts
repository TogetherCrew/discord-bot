import { Platform, IPlatform, IPlatformUpdateBody } from '@togethercrew.dev/db';
import { Snowflake, Client } from 'discord.js';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ module: 'PlatformService' });

/**
 * get platform by query
 * @param {Object} filter
 * @returns {Promise<IGuild | null>}
 */
async function getPlatform(filter: object): Promise<IPlatform | null> {
  return Platform.findOne(filter);
}

/**
 * Retrieve and return multiple platform entries that match the provided filter.
 * @param {object} filter - Filter criteria to match the desired platform entries.
 * @returns {Promise<object[]>} - A promise that resolves to an array of matching platform entries.
 */
async function getPlatforms(filter: object): Promise<IPlatform[]> {
  return await Platform.find(filter);
}

/**
 * Update the platform entry that matches the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired platform entry for update.
 * @param {IPlatformUpdateBody} updateBody - Updated information for the platform entry.
 * @returns {Promise<object|null>} - A promise that resolves to the updated platform entry, or null if not found.
 */
async function updatePlatform(filter: object, updateBody: IPlatformUpdateBody): Promise<IPlatform | null> {
  try {
    const platofrm = await Platform.findOne(filter);
    if (!platofrm) {
      return null;
    }
    Object.assign(platofrm, updateBody);
    return await platofrm.save();
  } catch (error) {
    logger.error({ database: 'Core', filter, updateBody, error }, 'Failed to update platofrm');
    return null;
  }
}

/**
 * Update multiple platform entries that match the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired platform entries for update.
 * @param {IPlatformUpdateBody} updateBody - Updated information for the platform entry.
 * @returns {Promise<number>} - A promise that resolves to the number of platform entries updated.
 */
async function updateManyPlatforms(filter: object, updateBody: IPlatformUpdateBody): Promise<number> {
  try {
    const updateResult = await Platform.updateMany(filter, updateBody);
    const modifiedCount = updateResult.modifiedCount;
    return modifiedCount;
  } catch (error) {
    logger.error({ database: 'Core', filter, updateBody, error }, 'Failed to update platofrms');
    return 0;
  }
}

async function checkBotAccessToGuild(client: Client, guildId: Snowflake) {
  if (!client.guilds.cache.has(guildId)) {
    await updatePlatform({ 'metadata.id': guildId }, { disconnectedAt: new Date() });
    return false;
  }
  return true;
}

export default {
  getPlatform,
  getPlatforms,
  updatePlatform,
  updateManyPlatforms,
  checkBotAccessToGuild,
};
