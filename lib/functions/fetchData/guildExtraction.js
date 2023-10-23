"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../database/services");
const fetchMessages_1 = __importDefault(require("./fetchMessages"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'GuildExtraction' });
/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
async function guildExtraction(connection, client, guildId) {
    logger.info({ guild_id: guildId }, 'Guild extraction for guild is running');
    try {
        const hasBotAccessToGuild = await services_1.guildService.checkBotAccessToGuild(client, guildId);
        if (!hasBotAccessToGuild) {
            return;
        }
        const guild = await client.guilds.fetch(guildId);
        const guildDoc = await services_1.guildService.getGuild({ guildId });
        if (guildDoc && guildDoc.selectedChannels && guildDoc.period) {
            await services_1.guildService.updateGuild({ guildId }, { isInProgress: true });
            const selectedChannelsIds = guildDoc.selectedChannels.map(selectedChannel => selectedChannel.channelId);
            for (const channelId of selectedChannelsIds) {
                const channel = await guild.channels.fetch(channelId);
                if (channel) {
                    if (channel.type !== 0)
                        continue;
                    await (0, fetchMessages_1.default)(connection, channel, guildDoc === null || guildDoc === void 0 ? void 0 : guildDoc.period);
                }
            }
        }
    }
    catch (err) {
        logger.error({ guild_id: guildId, err }, 'Guild extraction CronJob failed for guild');
    }
    logger.info({ guild_id: guildId }, 'Guild extraction for guild is done');
}
exports.default = guildExtraction;
