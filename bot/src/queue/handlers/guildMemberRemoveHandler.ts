import { type Snowflake } from 'discord.js'
import { guildMemberService } from '../../database/services'
import { DatabaseManager } from '@togethercrew.dev/db'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'GuildMemberRemoveHandler' })

export default async function (guildId: Snowflake, guildMemberId: Snowflake): Promise<void> {
    const logFields = { guild_id: guildId, guild_member_id: guildMemberId }
    // logger.info(logFields, 'event is running');
    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const guildMemberDoc = await guildMemberService.getGuildMember(connection, { discordId: guildMemberId })
        guildMemberDoc?.softDelete()
        // logger.info(logFields, 'event is done');
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to soft delete the guild member')
    }
}
