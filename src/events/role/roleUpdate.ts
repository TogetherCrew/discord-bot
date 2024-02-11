import { Events, type Role } from 'discord.js';
import { roleService } from '../../database/services';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.GuildRoleUpdate,
  once: false,
  execute(oldRole: Role, newRole: Role) {
    const dataToStore = roleService.getNeededDateFromRole(newRole);
    addDiscordEvent({ type: Events.GuildRoleUpdate, guildId: newRole.guild.id, newRole, dataToStore });
  },
};
