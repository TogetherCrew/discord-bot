import { Events, type Role } from 'discord.js';
import { addGuildEventQueue } from '../../queue/queues/guildEvent';

export default {
  name: Events.GuildRoleDelete,
  once: false,
  execute(role: Role) {
    addGuildEventQueue({ type: Events.GuildRoleDelete, guildId: role.guild.id, roleId: role.id });
  },
};
