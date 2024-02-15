import { Events, type GuildMember } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.GuildMemberRemove,
  once: false,
  execute(member: GuildMember) {
    addDiscordEvent({ type: Events.GuildMemberRemove, guildId: member.guild.id, guildMemberId: member.id });
  },
};
