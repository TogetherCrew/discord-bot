import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildMemberRemove' });

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember) {
    const logFields = { guild_id: member.guild.id, guild_member_id: member.user.id };
    logger.info(logFields, 'event is running');
    const connection = databaseService.connectionFactory(member.guild.id, config.mongoose.dbURL);
    try {
      const guildMemberDoc = await guildMemberService.getGuildMember(connection, { discordId: member.user.id });
      await guildMemberDoc?.softDelete();
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to soft delete the guild member');
    } finally {
      await closeConnection(connection);
      logger.info(logFields, 'event is done');
    }
  },
};
