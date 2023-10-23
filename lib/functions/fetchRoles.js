"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../database/services");
const logger_1 = __importDefault(require("../config/logger"));
const logger = logger_1.default.child({ module: 'FetchRoles' });
/**
 * Iterates over a list of roles and pushes extracted data from each role to an array.
 * @param {IRole[]} arr - The array to which extracted data will be pushed.
 * @param {Role[]} roleArray - An array of roles from which data is to be extracted.
 * @returns {IRole[]} - The updated array containing the extracted data.
 */
function pushRolesToArray(arr, roleArray) {
    for (const role of roleArray) {
        arr.push(services_1.roleService.getNeededDateFromRole(role));
    }
    return arr;
}
/**
 * Fetches and saves role information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract roles from.
 */
async function fetchGuildRoles(connection, client, guildId) {
    try {
        if (!client.guilds.cache.has(guildId)) {
            await services_1.guildService.updateGuild({ guildId }, { isDisconnected: false });
            return;
        }
        const guild = await client.guilds.fetch(guildId);
        const rolesToStore = [];
        pushRolesToArray(rolesToStore, [...guild.roles.cache.values()]);
        await services_1.roleService.createRoles(connection, rolesToStore); // assuming a 'roleService'
    }
    catch (error) {
        logger.error({ guildId, error }, 'Failed to fetch roles');
    }
}
exports.default = fetchGuildRoles;
