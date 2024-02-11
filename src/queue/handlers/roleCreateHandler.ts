import { type Snowflake } from 'discord.js';
import { roleService } from '../../database/services';
import { DatabaseManager, type IRole } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildRoleCreateHandler' });

export default async function (guildId: Snowflake, dataToStore: IRole): Promise<void> {
  const logFields = { guild_id: guildId, role_id: dataToStore.roleId };
  logger.info(logFields, 'event is running');
  const connection = await DatabaseManager.getInstance().getTenantDb(guildId);
  try {
    const roleDoc = await roleService.updateRole(connection, { roleId: dataToStore.roleId }, dataToStore);
    if (roleDoc === null) {
      await roleService.createRole(connection, dataToStore);
    }
    logger.info(logFields, 'event is done');
  } catch (err) {
    logger.error({ ...logFields, err }, 'Failed to handle role changes');
  }
}
