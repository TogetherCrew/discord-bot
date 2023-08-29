import { Events, Role } from 'discord.js';
import { roleService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleCreate' });

export default {
  name: Events.GuildRoleCreate,
  once: false,
  async execute(role: Role) {
    const logFields = { guild_id: role.guild.id, role_id: role.id };
    logger.info(logFields, 'event is running');
    const connection = databaseService.connectionFactory(role.guild.id, config.mongoose.dbURL);
    try {
      await roleService.handelRoleChanges(connection, role);
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle role changes');
    } finally {
      await closeConnection(connection);
      logger.info(logFields, 'event is done');
    }
  },
};
