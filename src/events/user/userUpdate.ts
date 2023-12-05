import { Events, User } from 'discord.js';
import { guildMemberService, platformService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'UserUpdate' });
export default {
  name: Events.UserUpdate,
  once: false,
  async execute(oldUser: User, newUser: User) {
    const logFields = { user_id: newUser.id };
    logger.info(logFields, 'event is running');
    try {
      const platforms = await platformService.getPlatforms({ disconnectedAt: null });
      for (let i = 0; i < platforms.length; i++) {
        const connection = DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
        await guildMemberService.updateGuildMember(
          connection,
          { discordId: newUser.id },
          {
            username: newUser.username,
            globalName: newUser.globalName,
          }
        );
        logger.info(logFields, 'event is done');
      }
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle user changes');
    }
  },
};
