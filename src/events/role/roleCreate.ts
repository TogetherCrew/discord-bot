import { Events, type Role } from 'discord.js';
import { roleService } from '../../database/services';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.GuildRoleCreate,
  once: false,
  execute(role: Role) {
    const dataToStore = roleService.getNeededDateFromRole(role);
    addDiscordEvent({ type: Events.GuildRoleCreate, guildId: role.guild.id,dataToStore })
  },
};
