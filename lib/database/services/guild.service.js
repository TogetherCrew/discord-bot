"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("@togethercrew.dev/db");
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'GuildService' });
/**
 * get guild by query
 * @param {Object} filter
 * @returns {Promise<IGuild | null>}
 */
async function getGuild(filter) {
    return db_1.Guild.findOne(filter);
}
/**
 * Retrieve and return multiple guild entries that match the provided filter.
 * @param {object} filter - Filter criteria to match the desired guild entries.
 * @returns {Promise<object[]>} - A promise that resolves to an array of matching guild entries.
 */
async function getGuilds(filter) {
    return await db_1.Guild.find(filter);
}
/**
 * Update the guild entry that matches the provided filter with the provided data.
 * @param {object} filter - Filter criteria to match the desired guild entry for update.
 * @param {IGuildUpdateBody} updateBody - Updated information for the guild entry.
 * @returns {Promise<object|null>} - A promise that resolves to the updated guild entry, or null if not found.
 */
async function updateGuild(filter, updateBody) {
    try {
        const guild = await db_1.Guild.findOne(filter);
        if (!guild) {
            return null;
        }
        Object.assign(guild, updateBody);
        return await guild.save();
    }
    catch (error) {
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
async function updateManyGuilds(filter, updateBody) {
    try {
        const updateResult = await db_1.Guild.updateMany(filter, updateBody);
        const modifiedCount = updateResult.modifiedCount;
        return modifiedCount;
    }
    catch (error) {
        logger.error({ database: 'RnDAO', filter, updateBody, error }, 'Failed to update guilds');
        return 0;
    }
}
async function checkBotAccessToGuild(client, guildId) {
    if (!client.guilds.cache.has(guildId)) {
        await updateGuild({ guildId }, { isDisconnected: false });
        return false;
    }
    return true;
}
exports.default = {
    getGuild,
    getGuilds,
    updateGuild,
    updateManyGuilds,
    checkBotAccessToGuild,
};
