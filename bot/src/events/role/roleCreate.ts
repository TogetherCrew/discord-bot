import { Events, type Role } from 'discord.js'
import { roleService } from '../../database/services'
import { addGuildEventQueue } from '../../queue/queues/guildEvent'

export default {
    name: Events.GuildRoleCreate,
    once: false,
    execute(role: Role) {
        const dataToStore = roleService.getNeededDateFromRole(role)
        addGuildEventQueue({
            type: Events.GuildRoleCreate,
            guildId: role.guild.id,
            dataToStore,
        })
    },
}
