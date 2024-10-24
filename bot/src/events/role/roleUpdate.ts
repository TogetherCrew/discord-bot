import { Events, type Role } from 'discord.js'
import { roleService } from '../../database/services'
import { addGuildEventQueue } from '../../queue/queues/guildEvent'

export default {
    name: Events.GuildRoleUpdate,
    once: false,
    execute(oldRole: Role, newRole: Role) {
        const dataToStore = roleService.getNeededDateFromRole(newRole)
        addGuildEventQueue({
            type: Events.GuildRoleUpdate,
            guildId: newRole.guild.id,
            newRole,
            dataToStore,
        })
    },
}
