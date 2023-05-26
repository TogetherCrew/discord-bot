import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from 'tc_dbcomm';
import config from '../../config';

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    try {
      const connection = databaseService.connectionFactory(oldMember.guild.id, config.mongoose.dbURL);
      const guildMember = await guildMemberService.updateGuildMember(
        connection,
        { discordId: oldMember.user.id },
        {
          username: newMember.user.username,
          avatar: newMember.user.avatar,
          joinedAt: newMember.joinedAt,
          roles: newMember.roles.cache.map(role => role.id),
          discriminator: newMember.user.discriminator,
        }
      );
      if (!guildMember) {
        guildMemberService.createGuildMember(connection, {
          discordId: newMember.user.id,
          username: newMember.user.username,
          avatar: newMember.user.avatar,
          joinedAt: newMember.joinedAt,
          roles: newMember.roles.cache.map(role => role.id),
          isBot: newMember.user.bot,
          discriminator: newMember.user.discriminator,
        });
      }
    } catch (err) {
      // TODO: improve error handling
      console.log(err);
    }
  },
};
