import { Events, type Role } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.GuildRoleDelete,
  once: false,
  execute(role: Role) {
    addDiscordEvent({ type: Events.GuildRoleDelete, guildId: role.guild.id, roleId: role.id });
  },
};
