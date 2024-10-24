import { type Snowflake, type Guild } from 'discord.js'
import { type Connection, type HydratedDocument } from 'mongoose'
import { type IPlatform, type IGuildMember } from '@togethercrew.dev/db'
import { guildMemberService, platformService } from '../database/services'
import { coreService } from '../services'

import parentLogger from '../config/logger'

const logger = parentLogger.child({ module: 'FetchMembers' })

const CHUNK_SIZE = 1000

/**
 * Fetches guild members in chunks.
 * @param {Guild} guild - The guild to fetch members from.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @returns {Promise<void>} - A promise that resolves when all members are fetched and stored.
 */
async function fetchMembersInChunks(
    guild: Guild,
    connection: Connection
): Promise<void> {
    let lastMemberId: Snowflake | undefined

    // TODO: fetch after latest stored guild member
    // const latestGuildMember = await guildMemberService.getLatestGuildMember(connection,{})
    // if(latestGuildMember !== null){
    //   lastMemberId=latestGuildMember.discordId;
    // }
    while (true) {
        const fetchedMembers = await guild.members.list({
            limit: CHUNK_SIZE,
            after: lastMemberId,
        })

        if (fetchedMembers.size === 0) {
            break
        }

        const membersToStore: IGuildMember[] = fetchedMembers.map(
            guildMemberService.getNeededDateFromGuildMember
        )

        await guildMemberService.createGuildMembers(connection, membersToStore)

        lastMemberId = fetchedMembers.last()?.id

        if (fetchedMembers.size < CHUNK_SIZE) {
            break
        }
    }
}

/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {HydratedDocument<IPlatform>} platform - The platform document containing guild information.
 */
export default async function fetchGuildMembers(
    connection: Connection,
    platform: HydratedDocument<IPlatform>
): Promise<void> {
    try {
        const client = await coreService.DiscordBotManager.getClient()
        const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(
            platform.metadata?.id
        )
        if (!hasBotAccessToGuild) {
            logger.info(
                { guild_id: platform.metadata?.id },
                'Bot access missing'
            )
            return
        }
        const guild = await client.guilds.fetch(platform.metadata?.id)
        logger.info({ guild_id: platform.metadata?.id }, 'Fetching members')
        await fetchMembersInChunks(guild, connection)
        logger.info(
            { guild_id: platform.metadata?.id },
            'Members stored successfully'
        )
    } catch (error) {
        logger.error(
            { guild_id: platform.metadata?.id, error },
            'Failed to fetch guild members'
        )
    }
}
