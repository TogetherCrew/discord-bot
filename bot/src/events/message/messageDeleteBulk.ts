import { Collection, Events, Message, Snowflake } from 'discord.js'

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue'

export default {
    name: Events.MessageBulkDelete,
    once: false,
    async execute(messages: Collection<Snowflake, Message>) {
        const first = messages.first()
        if (!first?.guildId) return

        const messageIds = messages.map((m) => m.id)

        addGuildMessageEventQueue({
            type: Events.MessageBulkDelete,
            guildId: first.guildId,
            messageIds,
            channelId: first.channelId,
        })
    },
}
