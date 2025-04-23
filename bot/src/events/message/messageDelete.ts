import { Events, Message } from 'discord.js';

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue';

export default {
    name: Events.MessageDelete,
    once: false,
    async execute(message: Message) {
        if (!message.guildId) return

        addGuildMessageEventQueue({
            type: Events.MessageDelete,
            guildId: message.guildId,
            messageId: message.id,
            channelId: message.channelId,
        })
    },
}
