import { Events, type GuildMember } from 'discord.js';
import { addGuildEventQueue } from '../../queue/queues/guildEvent';
import { guildMemberService } from '../../database/services';

export default {
  name: Events.GuildMemberAdd,
  once: false,
  execute(member: GuildMember) {
    const dataToStore = guildMemberService.getNeededDateFromGuildMember(member);
    addGuildEventQueue({ type: Events.GuildMemberAdd, guildId: member.guild.id, dataToStore });
  },
};
