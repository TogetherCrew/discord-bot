import { Events, type GuildMember } from 'discord.js';
import { addGuildEventQueue } from '../../queue/queues/guildEvent';
import { guildMemberService } from '../../database/services';

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  execute(oldMember: GuildMember, newMember: GuildMember) {
    const dataToStore = guildMemberService.getNeededDateFromGuildMember(newMember);
    addGuildEventQueue({ type: Events.GuildMemberUpdate, guildId: newMember.guild.id, dataToStore });
  },
};
