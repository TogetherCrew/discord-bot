"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../database/services");
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'FetchChannels' });
/**
 * Iterates over a list of channels and pushes extracted data from each channel to an array.
 * @param {IChannel[]} arr - The array to which extracted data will be pushed.
 * @param {Array<TextChannel | VoiceChannel | CategoryChannel>} channelArray - An array of channels from which data is to be extracted.
 * @returns {IChannel[]} - The updated array containing the extracted data.
 */
function pushChannelsToArray(arr, channelArray) {
    for (const channel of channelArray) {
        arr.push(services_1.channelService.getNeededDateFromChannel(channel));
    }
    return arr;
}
/**
 * Fetches and saves text and voice channel information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract text and voice channels from.
 */
async function fetchGuildChannels(connection, client, guildId) {
    try {
        if (!client.guilds.cache.has(guildId)) {
            await services_1.guildService.updateGuild({ guildId }, { isDisconnected: false });
            return;
        }
        const guild = await client.guilds.fetch(guildId);
        const channelsToStore = [];
        const textAndVoiceChannels = [...guild.channels.cache.values()].filter(channel => channel.type === 0 || channel.type === 2 || channel.type === 4);
        pushChannelsToArray(channelsToStore, textAndVoiceChannels);
        await services_1.channelService.createChannels(connection, channelsToStore); // assuming a 'channelService'
    }
    catch (error) {
        logger.error({ guildId, error }, 'Failed to fetch channels');
    }
}
exports.default = fetchGuildChannels;
