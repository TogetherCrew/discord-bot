import { type Role } from 'discord.js';
import { type Connection, type HydratedDocument } from 'mongoose';
import { type IPlatform, type IRole } from '@togethercrew.dev/db';
import { roleService, platformService } from '../database/services';
import parentLogger from '../config/logger';
import { coreService } from '../services';

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
 * @param {Snowflake} guildId - The identifier of the guild to extract roles from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function fetchGuildRoles(connection: Connection, platform: HydratedDocument<IPlatform>) {
  try {
    const client = await coreService.DiscordBotManager.getClient();
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(platform.metadata?.id);
    logger.info({
      hasBotAccessToGuild,
      guildId: platform.metadata?.id,
      type: 'role',
    });

    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    const rolesToStore: IRole[] = [];
    pushRolesToArray(rolesToStore, [...guild.roles.cache.values()]);
    await roleService.createRoles(connection, rolesToStore);
  } catch (error) {
    logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch roles');
  }
}
