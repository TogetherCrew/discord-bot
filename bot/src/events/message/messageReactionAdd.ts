// src/events/message/messageReactionAdd.ts
import { Events, MessageReaction, User } from 'discord.js'

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue'

export default {
    name: Events.MessageReactionAdd,
    once: false,
    async execute(reaction: MessageReaction, user: User) {
        const message = reaction.message
        if (!message.guildId) return

        addGuildMessageEventQueue({
            type: Events.MessageReactionAdd,
            guildId: message.guildId,
            messageId: message.id,
            channelId: message.channelId!,
            userId: user.id,
            emoji: reaction.emoji.name ?? reaction.emoji.toString(),
        })
    },
}
