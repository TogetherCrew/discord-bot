import { Snowflake } from 'discord.js';

import { DatabaseManager, IGuildMember } from '@togethercrew.dev/db';

import parentLogger from '../../config/logger';
import { guildMemberService } from '../../database/services';
import { isUserIgnoredForGuild } from '../../utils/guildIgnoredUsers';

const logger = parentLogger.child({ event: 'GuildMemberAddHandler' })

export default async function (guildId: Snowflake, dataToStore: IGuildMember): Promise<void> {
    const logFields = {
        guild_id: guildId,
        guild_member_id: dataToStore.discordId,
    }
    // logger.info(logFields, 'event is running');
    if (isUserIgnoredForGuild(guildId, dataToStore.discordId)) return
    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const guildMemberDoc = await guildMemberService.updateGuildMember(
            connection,
            { discordId: dataToStore.discordId },
            dataToStore
        )
        if (guildMemberDoc === null) {
            await guildMemberService.createGuildMember(connection, dataToStore)
        }
        // logger.info(logFields, 'event is done');
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to handle guild member changes')
    }
}
