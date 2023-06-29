import { Client, Snowflake, Role } from 'discord.js';
import { Connection } from 'mongoose';
import { IRole } from '@togethercrew.dev/db';
import { roleService, guildService } from '../database/services';

/**
* Extracts necessary data from a given role.
* @param {Role} role - The discord.js role object from which data is to be extracted.
* @returns {IRole} - The extracted data in the form of an IRole object.
*/
function getNeedDataFromRole(role: Role): IRole {
    return {
        id: role.id,
        name: role.name,
        color: role.color,
    };
}

/**
* Iterates over a list of roles and pushes extracted data from each role to an array.
* @param {IRole[]} arr - The array to which extracted data will be pushed.
* @param {Role[]} roleArray - An array of roles from which data is to be extracted.
* @returns {IRole[]} - The updated array containing the extracted data.
*/
function pushRolesToArray(arr: IRole[], roleArray: Role[]): IRole[] {
    for (const role of roleArray) {
        arr.push(getNeedDataFromRole(role));
    }
    return arr;
}


/**
* Fetches and saves role information from a given guild.
* @param {Connection} connection - Mongoose connection object for the database.
* @param {Client} client - The discord.js client object used to fetch the guild.
* @param {Snowflake} guildId - The identifier of the guild to extract roles from.
*/
export default async function fetchGuildRoles(connection: Connection, client: Client, guildId: Snowflake) {
    console.log(`Fetching roles for guild: ${guildId}`)
    try {
        if (!client.guilds.cache.has(guildId)) {
            await guildService.updateGuild({ guildId }, { isDisconnected: false })
            return
        }
        const guild = await client.guilds.fetch(guildId);
        const rolesToStore: IRole[] = [];
        pushRolesToArray(rolesToStore, [...guild.roles.cache.values()]);
        await roleService.createRoles(connection, rolesToStore); // assuming a 'roleService'
    } catch (err) {
        console.error(`Failed to fetch roles of guild ${guildId}`, err);
    }
    console.log(`Completed fetching roles for guild: ${guildId}`)
}