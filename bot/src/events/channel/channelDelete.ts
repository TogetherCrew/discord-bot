import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js'
import { addGuildEventQueue } from '../../queue/queues/guildEvent'

export default {
    name: Events.ChannelDelete,
    once: false,
    execute(channel: Channel) {
        if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
            addGuildEventQueue({
                type: Events.ChannelDelete,
                guildId: channel.guildId,
                channelId: channel.id,
            })
        }
    },
}
