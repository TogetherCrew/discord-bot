import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    try {
      const connection = databaseService.connectionFactory(member.guild.id, config.mongoose.dbURL);
      await guildMemberService.createGuildMember(connection, {
        discordId: member.user.id,
        username: member.user.username,
        avatar: member.user.avatar,
        joinedAt: member.joinedAt,
        roles: member.roles.cache.map(role => role.id),
        isBot: member.user.bot,
        discriminator: member.user.discriminator,
      });
      await closeConnection(connection)

    } catch (err) {
      // TODO: improve error handling
      console.log(err);
    }
  },
};
