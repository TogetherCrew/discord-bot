import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import DatabaseManager from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleUpdate' });

export default {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole: Role, newRole: Role) {
    const logFields = { guild_id: newRole.guild.id, role_id: newRole.id };
    logger.info(logFields, 'event is running');
    const connection = DatabaseManager.getInstance().getTenantDb(newRole.guild.id);
    try {
      await roleService.handelRoleChanges(connection, newRole);
      logger.info(logFields, 'event is done');
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle role changes');
    }
  },
};
