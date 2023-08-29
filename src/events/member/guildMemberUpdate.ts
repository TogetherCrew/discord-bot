import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { databaseService } from '@togethercrew.dev/db';
import config from '../../config';
import { closeConnection } from '../../database/connection';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildMemberUpdate' });

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    const logFields = { guild_id: newMember.guild.id, guild_member_id: newMember.user.id };
    logger.info(logFields, 'event is running');
    const connection = databaseService.connectionFactory(newMember.guild.id, config.mongoose.dbURL);
    try {
      await guildMemberService.handelGuildMemberChanges(connection, newMember);
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle guild member changes');
    } finally {
      await closeConnection(connection);
      logger.info(logFields, 'event is done');
    }
  },
};
