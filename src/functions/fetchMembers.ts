import { GuildMember, Client } from 'discord.js';
import { Connection, HydratedDocument } from 'mongoose';
import { IPlatform } from '@togethercrew.dev/db';
import { IGuildMember, } from '@togethercrew.dev/db';
import { guildMemberService, platformService } from '../database/services';

import parentLogger from '../config/logger';
console.log('FLAG')

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
export default async function fetchGuildMembers(connection: Connection, client: Client, platform: HydratedDocument<IPlatform>) {
  try {
    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(client, platform.metadata?.id);
    if (!hasBotAccessToGuild) {
      return;
    }
    const guild = await client.guilds.fetch(platform.metadata?.id);
    const membersToStore: IGuildMember[] = [];
    const fetchMembers = await guild.members.fetch();
    pushMembersToArray(membersToStore, [...fetchMembers.values()]);
    await guildMemberService.createGuildMembers(connection, membersToStore);
  } catch (error) {
    logger.error({ guild_id: platform.metadata?.id, error }, 'Failed to fetch guild members');
  }
}
