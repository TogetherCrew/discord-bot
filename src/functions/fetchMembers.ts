import { GuildMember, Client, Snowflake } from 'discord.js';
import { Connection } from 'mongoose';
import { IGuildMember } from '@togethercrew.dev/db';
import { guildMemberService, guildService } from '../database/services';
import parentLogger from '../config/logger';

const logger = parentLogger.child({ module: 'FetchMembers' });

/**
 * Iterates over a list of guild members and pushes extracted data from each guild member to an array.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
 * @param {GuildMember[]} guildMembersArray - An array of guild members from which data is to be extracted.
 * @returns {Promise<IGuildMember[]>} - A promise that resolves to the updated array containing the extracted data.
 */
function pushMembersToArray(arr: IGuildMember[], guildMembersArray: GuildMember[]): IGuildMember[] {
  for (const guildMember of guildMembersArray) {
    arr.push(guildMemberService.getNeededDateFromGuildMember(guildMember));
  }
  return arr;
}

/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
export default async function fetchGuildMembers(connection: Connection, client: Client, guildId: Snowflake) {
  try {
    if (!client.guilds.cache.has(guildId)) {
      await guildService.updateGuild({ guildId }, { isDisconnected: false });
      return;
    }
    const guild = await client.guilds.fetch(guildId);
    const membersToStore: IGuildMember[] = [];
    const fetchMembers = await guild.members.fetch();
    pushMembersToArray(membersToStore, [...fetchMembers.values()]);
    await guildMemberService.createGuildMembers(connection, membersToStore);
  } catch (error) {
    logger.error({ guildId, error }, 'Failed to fetch guild members');
  }
}
