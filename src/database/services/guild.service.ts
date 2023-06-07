import { Guild, IDiscordGuild, IGuild, IGuildUpdateBody } from '@togethercrew.dev/db';
import { Snowflake } from 'discord.js';

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
  try {
    return await Guild.find(filter);
  } catch (error) {
    console.log('Failed to retrieve guilds', error);
    return [];
  }
}

/**
 * Update the guild entry that matches the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired guild entry for update.
 * @param {IGuildUpdateBody} UpdateBody - Updated information for the guild entry.
 * @returns {Promise<object|null>} - A promise that resolves to the updated guild entry, or null if not found.
 */
async function updateGuild(filter: object, UpdateBody: IGuildUpdateBody): Promise<IGuild | null> {
  try {
    const guild = await Guild.findOne(filter);
    if (!guild) {
      return null;
    }
    Object.assign(guild, UpdateBody);
    return await guild.save();
  } catch (error) {
    console.log('Failed to update guild', error);
    return null;
  }
}

/**
 * Update multiple guild entries that match the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired guild entries for update.
 * @param {IGuildUpdateBody} UpdateBody - Updated information for the guild entry.
 * @returns {Promise<number>} - A promise that resolves to the number of guild entries updated.
 */
async function updateManyGuilds(filter: object, UpdateBody: IGuildUpdateBody): Promise<number> {
  try {
    const updateResult = await Guild.updateMany(filter, UpdateBody);
    const modifiedCount = updateResult.modifiedCount;
    return modifiedCount;
  } catch (error) {
    console.log('Failed to update guilds', error);
    return 0;
  }
}

async function createGuild(data: IDiscordGuild, discordId: Snowflake) {
  return Guild.create({
      guildId: data.id,
      user: discordId,
      name: data.name,
      icon: data.icon
  });
}

export default {
  getGuild,
  getGuilds,
  updateGuild,
  updateManyGuilds,
  createGuild,
};
