import { Events, GuildMember } from 'discord.js';
import { guildMemberService } from '../../database/services';
import { DatabaseManager } from '@togethercrew.dev/db';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'GuildMemberAdd' });

export default {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member: GuildMember) {
    const logFields = { guild_id: member.guild.id, guild_member_id: member.user.id };
    logger.info(logFields, 'event is running');
    const connection = await DatabaseManager.getInstance().getTenantDb(member.guild.id);
    try {
      await guildMemberService.handelGuildMemberChanges(connection, member);
      logger.info(logFields, 'event is done');
    } catch (err) {
      logger.error({ ...logFields, err }, 'Failed to handle guild member changes');
    }
  },
};
