import { Events, type Guild } from 'discord.js'
import { addGuildEventQueue } from '../../queue/queues/guildEvent'
import { guildMemberService } from '../../database/services'
import config from '../../config'
export default {
    name: Events.GuildCreate,
    once: false,
    async execute(guild: Guild) {
        const botMember = await guild.members.fetch(config.discord.clientId)
        const dataToStore =
            guildMemberService.getNeededDateFromGuildMember(botMember)
        addGuildEventQueue({
            type: Events.GuildMemberUpdate,
            guildId: botMember.guild.id,
            dataToStore,
        })
    },
}
