import { Events, Message } from 'discord.js';

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue';

export default {
    name: Events.MessageReactionRemoveAll,
    once: false,
    async execute(message: Message) {
        if (!message.guildId) return

        addGuildMessageEventQueue({
            type: Events.MessageReactionRemoveAll,
            guildId: message.guildId,
            messageId: message.id,
            channelId: message.channelId!,
        })
    },
}
