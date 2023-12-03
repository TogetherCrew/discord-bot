import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleCreate' });

export default {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(role: Role) {
    const logFields = { guild_id: role.guild.id, role_id: role.id };
    logger.info(logFields, 'event is running');
    const connection = DatabaseManager.getInstance().getTenantDb(role.guild.id);
    try {
      await roleService.handelRoleChanges(connection, role);
      logger.info(logFields, 'event is done');
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle role changes');
    }
  },
};
