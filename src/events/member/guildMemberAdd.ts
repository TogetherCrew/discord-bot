import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    console.log('wtf')
    try {
      const connection = databaseService.connectionFactory(member.guild.id, config.mongoose.dbURL);
      const guildMemberDoc = await guildMemberService.getGuildMember(connection, { discordId: member.user.id });
      if (guildMemberDoc) {
        await guildMemberService.updateGuildMember(
          connection,
          { discordId: member.user.id },
          {
            username: member.user.username,
            avatar: member.user.avatar,
            joinedAt: member.joinedAt,
            roles: member.roles.cache.map(role => role.id),
            discriminator: member.user.discriminator,
            deletedAt: null,
            permissions: member.permissions.bitfield.toString(),
            nickname: member.nickname
          }
        );
      }
      else {
        await guildMemberService.createGuildMember(connection, {
          discordId: member.user.id,
          username: member.user.username,
          avatar: member.user.avatar,
          joinedAt: member.joinedAt,
          roles: member.roles.cache.map(role => role.id),
          isBot: member.user.bot,
          discriminator: member.user.discriminator,
          permissions: member.permissions.bitfield.toString(),
          nickname: member.nickname
        });
      }
      await closeConnection(connection)
    } catch (err) {
      // TODO: improve error handling
      console.log(err);
    }
  },
};