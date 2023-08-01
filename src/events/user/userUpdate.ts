import { Events, User } from 'discord.js';
import { guildMemberService, guildService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
  name: Events.UserUpdate,
  once: false,
  async execute(oldUser: User, newUser: User) {
    try {
      const guilds = await guildService.getGuilds({});
      for (let i = 0; i < guilds.length; i++) {
        const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
        await guildMemberService.updateGuildMember(
          connection,
          { discordId: newUser.id },
          {
            username: newUser.username,
            globalName: newUser.globalName,
          }
        );
        await closeConnection(connection);
      }
    } catch (err) {
      // TODO: improve error handling
      console.log(err);
    }
  },
};
