"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../database/services");
const logger_1 = __importDefault(require("../config/logger"));
const logger = logger_1.default.child({ module: 'FetchMembers' });
/**
 * Iterates over a list of guild members and pushes extracted data from each guild member to an array.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
 * @param {GuildMember[]} guildMembersArray - An array of guild members from which data is to be extracted.
 * @returns {Promise<IGuildMember[]>} - A promise that resolves to the updated array containing the extracted data.
 */
function pushMembersToArray(arr, guildMembersArray) {
    for (const guildMember of guildMembersArray) {
        arr.push(services_1.guildMemberService.getNeededDateFromGuildMember(guildMember));
    }
    return arr;
}
/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
async function fetchGuildMembers(connection, client, guildId) {
    try {
        if (!client.guilds.cache.has(guildId)) {
            await services_1.guildService.updateGuild({ guildId }, { isDisconnected: false });
            return;
        }
        const guild = await client.guilds.fetch(guildId);
        const membersToStore = [];
        const fetchMembers = await guild.members.fetch();
        pushMembersToArray(membersToStore, [...fetchMembers.values()]);
        await services_1.guildMemberService.createGuildMembers(connection, membersToStore);
    }
    catch (error) {
        logger.error({ guildId, error }, 'Failed to fetch guild members');
    }
}
exports.default = fetchGuildMembers;
