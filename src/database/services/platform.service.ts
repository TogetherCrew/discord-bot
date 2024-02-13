import { type HydratedDocument } from 'mongoose';
import { Platform, type IPlatform, type IPlatformUpdateBody } from '@togethercrew.dev/db';
import { type Snowflake } from 'discord.js';
import { coreService } from '../../services';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ module: 'PlatformService' });

/**
 * get platform by query
 * @param {Object} filter
 * @returns {Promise<IGuild | null>}
 */
async function getPlatform(filter: object): Promise<HydratedDocument<IPlatform> | null> {
  return await Platform.findOne(filter);
}

/**
 * Retrieve and return multiple platform entries that match the provided filter.
 * @param {object} filter - Filter criteria to match the desired platform entries.
 * @returns {Promise<object[]>} - A promise that resolves to an array of matching platform entries.
 */
async function getPlatforms(filter: object): Promise<Array<HydratedDocument<IPlatform>>> {
  return await Platform.find(filter);
}

/**
 * Update the platform entry that matches the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired platform entry for update.
 * @param {IPlatformUpdateBody} updateBody - Updated information for the platform entry.
 * @returns {Promise<object|null>} - A promise that resolves to the updated platform entry, or null if not found.
 */
async function updatePlatform(
  filter: object,
  updateBody: IPlatformUpdateBody,
): Promise<HydratedDocument<IPlatform> | null> {
  try {
    const platform = await Platform.findOne(filter);
    if (platform === null) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (updateBody.metadata) {
      updateBody.metadata = {
        ...platform.metadata,
        ...updateBody.metadata,
      };
    }

    Object.assign(platform, updateBody);
    await platform.save();
    return platform;
  } catch (error) {
    logger.error({ database: 'Core', filter, updateBody, error }, 'Failed to update platform');
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
    logger.error({ database: 'Core', filter, updateBody, error }, 'Failed to update platforms');
    return 0;
  }
}

async function checkBotAccessToGuild(guildId: Snowflake): Promise<boolean> {
  const client = await coreService.DiscordBotManager.getClient();
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
