import { guildMemberService, platformService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

interface IdataToStore {
  username: string,
  globalName: string,
  discordId: string
}
const logger = parentLogger.child({ event: 'UserUpdateHandler' });
export default async function (dataToStore: IdataToStore): Promise<void> {
  const logFields = { user_id: dataToStore.discordId };
  logger.info(logFields, 'event is running');
  try {
    const platforms = await platformService.getPlatforms({
      disconnectedAt: null,
    });
    for (let i = 0; i < platforms.length; i++) {
      const connection = await DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);


      await guildMemberService.updateGuildMember(
        connection,
        { discordId: dataToStore.discordId },
        {
          username: dataToStore.username,
          globalName: dataToStore.globalName,
        },
      );
      logger.info(logFields, 'event is done');
    }
  } catch (err) {
    logger.error({ ...logFields, err }, 'Failed to handle user changes');
  }
}
