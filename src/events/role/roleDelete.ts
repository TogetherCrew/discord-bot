import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleDelete' });

export default {
  name: Events.GuildRoleDelete,
  once: false,
  async execute(role: Role) {
    const logFields = { guild_id: role.guild.id, role_id: role.id };
    logger.info(logFields, 'event is running');
    const connection = databaseService.connectionFactory(role.guild.id, config.mongoose.dbURL);
    try {
      const roleDoc = await roleService.getRole(connection, { roleId: role.id });
      await roleDoc?.softDelete();
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to soft delete the role');
    } finally {
      await closeConnection(connection);
      logger.info(logFields, 'event is done');
    }
  },
};
