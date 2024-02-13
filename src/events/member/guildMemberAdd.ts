import { Events, type GuildMember } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';
import { guildMemberService } from '../../database/services';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  execute(member: GuildMember) {
    const dataToStore = guildMemberService.getNeededDateFromGuildMember(member);
    addDiscordEvent({ type: Events.GuildMemberAdd, guildId: member.guild.id, dataToStore });
  },
};
