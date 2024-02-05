import { type GuildMember } from 'discord.js'
import { type Connection, type HydratedDocument } from 'mongoose'
import { type IPlatform, type IGuildMember } from '@togethercrew.dev/db'
import { guildMemberService, platformService } from '../database/services'
import { coreService } from '../services'

import parentLogger from '../config/logger'

const logger = parentLogger.child({ module: 'FetchMembers' })

/**
 * Iterates over a list of guild members and pushes extracted data from each guild member to an array.
 * @param {GuildMember[]} guildMembersArray - An array of guild members from which data is to be extracted.
 * @returns {Promise<IGuildMember[]>} - A promise that resolves to the updated array containing the extracted data.
 */
function pushMembersToArray(
  arr: IGuildMember[],
  guildMembersArray: GuildMember[]
): IGuildMember[] {
  for (const guildMember of guildMembersArray) {
    arr.push(guildMemberService.getNeededDateFromGuildMember(guildMember))
  }
  return arr
}

/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function fetchGuildMembers(
  connection: Connection,
  platform: HydratedDocument<IPlatform>
) {
  try {
    const client = await coreService.DiscordBotManager.getClient()

    const hasBotAccessToGuild = await platformService.checkBotAccessToGuild(
      platform.metadata?.id
    )
    logger.info({
      hasBotAccessToGuild,
      guildId: platform.metadata?.id,
      type: 'guild member',
    })

    if (!hasBotAccessToGuild) {
      return
    }
    const guild = await client.guilds.fetch(platform.metadata?.id)
    const membersToStore: IGuildMember[] = []
    const fetchMembers = await guild.members.fetch()
    pushMembersToArray(membersToStore, [...fetchMembers.values()])
    await guildMemberService.createGuildMembers(connection, membersToStore)
  } catch (error) {
    logger.error(
      { guild_id: platform.metadata?.id, error },
      'Failed to fetch guild members'
    )
  }
}
