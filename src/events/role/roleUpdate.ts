import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleUpdate' });

export default {
  name: Events.GuildRoleUpdate,
  once: false,
  async execute(oldRole: Role, newRole: Role) {
    const logFields = { guild_id: newRole.guild.id, role_id: newRole.id };
    logger.info(logFields, 'event is running');
    const connection = databaseService.connectionFactory(newRole.guild.id, config.mongoose.dbURL);
    try {
      await roleService.handelRoleChanges(connection, newRole);
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle role changes');
    } finally {
      await closeConnection(connection);
      logger.info(logFields, 'event is done');
    }
  },
};
