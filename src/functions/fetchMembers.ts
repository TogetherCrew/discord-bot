import { GuildMember, Guild } from 'discord.js';
import { Connection } from 'mongoose';
import { IGuildMember } from 'tc_dbcomm';
import { guildMemberService } from '../database/services';

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
 * Fetches guild members from a specified guild
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Guild} guild - The guild from which guild members are to be fetched.
 * @throws Will throw an error if an issue is encountered during processing.
 */
export default async function fetchGuildMembers(connection: Connection, guild: Guild) {
    try {
        const membersToStore: IGuildMember[] = [];
        const fetchMembers = await guild.members.fetch();
        pushMembersToArray(membersToStore, [...fetchMembers.values()])
        await guildMemberService.createGuildMembers(connection, membersToStore);

    } catch (err) {
        console.error(`Failed to fetch members of guild ${guild.id}`, err);
        throw err;
    }
}