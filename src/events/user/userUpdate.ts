import { Events, User } from 'discord.js';
import { guildMemberService, guildService } from '../../database/services';
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
      const guilds = await guildService.getGuilds({});
      for (let i = 0; i < guilds.length; i++) {
        const connection = DatabaseManager.getInstance().getTenantDb(guilds[i].guildId);
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
