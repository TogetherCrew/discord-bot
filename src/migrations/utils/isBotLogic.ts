import { Client, Snowflake } from 'discord.js';
import { GuildMember } from 'discord.js';
import { Connection } from 'mongoose';
import parentLogger from '../../config/logger';
import { guildMemberService } from '../../database/services';
import { IGuildMember, } from '@togethercrew.dev/db';

const logger = parentLogger.child({ module: 'Migration-isBot' });

/**
 * Iterates over a list of guild members and pushes extracted data from each guild member to an array.
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
 *
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
export default async function isBotLogic(connection: Connection, client: Client, guildId: Snowflake) {
    logger.info({ guild_id: guildId }, 'add-isBot-to-guilbMember-schema migration is running');
    try {
        console.log(guildId)
        const botGuildMembers = [];
        const noneBotGuildMembers = [];

        const guild = await client.guilds.fetch(guildId);
        console.log(guild.id)
        const membersToStore: IGuildMember[] = [];
        console.log(1)
        const fetchedMembers = await guild.members.fetch();
        console.log(2)
        const guildMembers = pushMembersToArray(membersToStore, [...fetchedMembers.values()]);

        console.log(guildMembers.length, guildId)
        if (guildMembers) {
            for (const guildMember of guildMembers) {
                if (guildMember.isBot) {
                    botGuildMembers.push(guildMember.discordId);
                } else {
                    noneBotGuildMembers.push(guildMember.discordId);
                }
            }
        }

        if (botGuildMembers.length > 0) {
            await guildMemberService.updateGuildMembers(
                connection,
                { discordId: { $in: botGuildMembers } },
                { isBot: true }
            );
        }

        if (noneBotGuildMembers.length > 0) {
            await guildMemberService.updateGuildMembers(
                connection,
                { discordId: { $in: noneBotGuildMembers } },
                { isBot: false }
            );
        }

        const mergedArray = botGuildMembers.concat(noneBotGuildMembers);
        if (mergedArray.length > 0) {
            await guildMemberService.updateGuildMembers(
                connection,
                { discordId: { $nin: mergedArray } },
                { isBot: null }
            );
        }

    } catch (err) {
        logger.error({ guild_id: guildId, err }, 'add-isBot-to-guilbMember-schema migration is failed');
    }
    logger.info({ guild_id: guildId }, 'add-isBot-to-guilbMember-schema migration is done');
}