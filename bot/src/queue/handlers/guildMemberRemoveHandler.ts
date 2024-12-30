import { Snowflake } from 'discord.js';

import { DatabaseManager } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { guildMemberService } from '../../database/services';
import { isUserIgnoredForGuild } from '../../utils/guildIgnoredUsers';

const logger = parentLogger.child({ event: 'GuildMemberRemoveHandler' })

export default async function (guildId: Snowflake, guildMemberId: Snowflake): Promise<void> {
    const logFields = { guild_id: guildId, guild_member_id: guildMemberId }
    // logger.info(logFields, 'event is running');
    if (isUserIgnoredForGuild(guildId, guildMemberId)) return

    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const guildMemberDoc = await guildMemberService.getGuildMember(connection, { discordId: guildMemberId })
        guildMemberDoc?.softDelete()
        // logger.info(logFields, 'event is done');
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to soft delete the guild member')
    }
}
