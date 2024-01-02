import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import parentLogger from '../../config/logger';
import DatabaseManager from '../../database/connection';

const logger = parentLogger.child({ event: 'GuildMemberUpdate' });

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    const logFields = { guild_id: newMember.guild.id, guild_member_id: newMember.user.id };
    logger.info(logFields, 'event is running');
    const connection = DatabaseManager.getInstance().getTenantDb(newMember.guild.id);
    logger.info(logFields, 'event is done');
    try {
      await guildMemberService.handelGuildMemberChanges(connection, newMember);
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle guild member changes');
    }
  },
};
