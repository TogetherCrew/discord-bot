import { GuildMember, Client, Snowflake } from 'discord.js';
import { Connection } from 'mongoose';
import { IGuildMember } from '@togethercrew.dev/db';
import { guildMemberService, guildService } from '../database/services';

/**
* Extracts necessary data from a given guild member.
* @param {IGuildMember} guildMember - The guild member object from which data is to be extracted.
* @returns {Promise<IGuildMember>} - A promise that resolves to an object of type IRawInfo containing the extracted data.
*/
function getNeedDataFromGuildMember(guildMember: GuildMember): IGuildMember {
    return {
        discordId: guildMember.user.id,
        username: guildMember.user.username,
        avatar: guildMember.user.avatar,
        joinedAt: guildMember.joinedAt,
        roles: guildMember.roles.cache.map(role => role.id),
        isBot: guildMember.user.bot,
        discriminator: guildMember.user.discriminator,
        permissions: guildMember.permissions.bitfield.toString(),
        nickname: guildMember.nickname
    };
}


/**
* Iterates over a list of guild members and pushes extracted data from each guild member to an array.
* @param {Connection} connection - Mongoose connection object for the database.
* @param {IRawInfo[]} arr - The array to which extracted data will be pushed.
* @param {GuildMember[]} guildMembersArray - An array of guild members from which data is to be extracted.
* @returns {Promise<IGuildMember[]>} - A promise that resolves to the updated array containing the extracted data.
*/
function pushMembersToArray(
    arr: IGuildMember[],
    guildMembersArray: GuildMember[],
): IGuildMember[] {
    for (const guildMember of guildMembersArray) {
        arr.push(getNeedDataFromGuildMember(guildMember));
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
    console.log(`Fetching members for guild: ${guildId}`)
    try {
        if (!client.guilds.cache.has(guildId)) {
            await guildService.updateGuild({ guildId }, { isDisconnected: false })
            return
        }
        const guild = await client.guilds.fetch(guildId);
        const membersToStore: IGuildMember[] = [];
        const fetchMembers = await guild.members.fetch();
        pushMembersToArray(membersToStore, [...fetchMembers.values()])
        await guildMemberService.createGuildMembers(connection, membersToStore);

    } catch (err) {
        console.error(`Failed to fetch members of guild ${guildId}`, err);
    }
    console.log(`Completed fetching members for guild: ${guildId}`)
}