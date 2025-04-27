import { Events, MessageReaction } from 'discord.js'

import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue'

export default {
    name: Events.MessageReactionRemoveEmoji,
    once: false,
    async execute(reaction: MessageReaction) {
        const message = reaction.message
        if (!message.guildId) return

        addGuildMessageEventQueue({
            type: Events.MessageReactionRemoveEmoji,
            guildId: message.guildId,
            messageId: message.id,
            channelId: message.channelId!,
            emoji: reaction.emoji.name ?? reaction.emoji.toString(),
        })
    },
}
