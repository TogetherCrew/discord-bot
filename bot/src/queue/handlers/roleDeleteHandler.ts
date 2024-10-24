import { type Snowflake } from 'discord.js'
import { roleService } from '../../database/services'
import { DatabaseManager } from '@togethercrew.dev/db'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'GuildRoleDeleteHandler' })

export default async function (guildId: Snowflake, roleId: Snowflake): Promise<void> {
    const logFields = { guild_id: guildId, role_id: roleId }
    // logger.info(logFields, 'event is running');
    const connection = await DatabaseManager.getInstance().getGuildDb(guildId)
    try {
        const roleDoc = await roleService.getRole(connection, { roleId })
        roleDoc?.softDelete()
        // logger.info(logFields, 'event is done');
    } catch (err) {
        logger.error({ ...logFields, err }, 'Failed to soft delete the role')
    }
}
