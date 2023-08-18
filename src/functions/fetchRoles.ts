import { Client, Snowflake, Role } from 'discord.js';
import { Connection } from 'mongoose';
import { IRole } from '@togethercrew.dev/db';
import { roleService, guildService } from '../database/services';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ module: 'FetchRoles' });

/**
 * Iterates over a list of roles and pushes extracted data from each role to an array.
 * @param {IRole[]} arr - The array to which extracted data will be pushed.
 * @param {Role[]} roleArray - An array of roles from which data is to be extracted.
 * @returns {IRole[]} - The updated array containing the extracted data.
 */
function pushRolesToArray(arr: IRole[], roleArray: Role[]): IRole[] {
  for (const role of roleArray) {
    arr.push(roleService.getNeededDateFromRole(role));
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
  try {
    if (!client.guilds.cache.has(guildId)) {
      await guildService.updateGuild({ guildId }, { isDisconnected: false });
      return;
    }
    const guild = await client.guilds.fetch(guildId);
    const rolesToStore: IRole[] = [];
    pushRolesToArray(rolesToStore, [...guild.roles.cache.values()]);
    await roleService.createRoles(connection, rolesToStore); // assuming a 'roleService'
  } catch (error) {
    logger.error({ guildId, error }, 'Failed to fetch roles');
  }
}
