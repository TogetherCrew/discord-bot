import { Events, type Role } from 'discord.js'
import { roleService } from '../../database/services'
import { DatabaseManager } from '@togethercrew.dev/db'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ event: 'GuildRoleDelete' })

export default {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role: Role) {
    const logFields = { guild_id: role.guild.id, role_id: role.id }
    logger.info(logFields, 'event is running')
    const connection = await DatabaseManager.getInstance().getTenantDb(
      role.guild.id
    )
    try {
      const roleDoc = await roleService.getRole(connection, { roleId: role.id })
      roleDoc?.softDelete()
      logger.info(logFields, 'event is done')
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to soft delete the role')
    }
  },
}
