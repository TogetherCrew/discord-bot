import { Events, type GuildMember } from 'discord.js'
import { guildMemberService } from '../../database/services'
import { DatabaseManager } from '@togethercrew.dev/db'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'GuildMemberUpdate' })

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    const logFields = {
      guild_id: newMember.guild.id,
      guild_member_id: newMember.user.id,
    }
    logger.info(logFields, 'event is running')
    const connection = await DatabaseManager.getInstance().getTenantDb(
      newMember.guild.id
    )
    try {
      await guildMemberService.handelGuildMemberChanges(connection, newMember)
      logger.info(logFields, 'event is done')
    } catch (err) {
      logger.error(
        { ...logFields, err },
        'Failed to handle guild member changes'
      )
    }
  },
}
