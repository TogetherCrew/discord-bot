import { Events, type GuildMember } from 'discord.js';
import { addGuildEventQueue } from '../../queue/queues/guildEvent';

export default {
  name: Events.GuildMemberRemove,
  once: false,
  execute(member: GuildMember) {
    addGuildEventQueue({ type: Events.GuildMemberRemove, guildId: member.guild.id, guildMemberId: member.id });
  },
};
