import { Events, MessageReaction, User } from 'discord.js'

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue'

export default {
    name: Events.MessageReactionRemove,
    once: false,
    async execute(reaction: MessageReaction, user: User) {
        const message = reaction.message
        if (!message.guildId) return

        addGuildMessageEventQueue({
            type: Events.MessageReactionRemove,
            guildId: message.guildId,
            messageId: message.id,
            channelId: message.channelId!,
            userId: user.id,
            emoji: reaction.emoji.name ?? reaction.emoji.toString(),
        })
    },
}
