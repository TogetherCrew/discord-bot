import { Events, type GuildMember } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';
import { guildMemberService } from '../../database/services';

export default {
  name: Events.GuildMemberUpdate,
  once: false,
  execute(oldMember: GuildMember, newMember: GuildMember) {
    const dataToStore = guildMemberService.getNeededDateFromGuildMember(newMember);
    addDiscordEvent({ type: Events.GuildMemberUpdate, guildId: newMember.guild.id, dataToStore })
  }
};
