import { Events, Message, Snowflake } from 'discord.js';

import { rawInfoService } from '../../database/services';
import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue';

interface threadInfo {
    threadId: Snowflake
    threadName: string
    channelId: Snowflake | undefined
    channelName: string | undefined
}
export default {
    name: Events.MessageUpdate,
    once: false,
    async execute(oldMessage: Message, newMessage: Message) {
        let threadInfo: threadInfo | undefined

        if (!newMessage.guildId) return
        if (newMessage.channel.isThread()) {
            threadInfo = {
                threadId: newMessage.channel.id,
                threadName: newMessage.channel.name,
                channelId: newMessage.channel.id,
                channelName: newMessage.channel.parent?.name,
            }
        }
        try {
            const data = await rawInfoService.getNeedDataFromMessage(newMessage, threadInfo)

            addGuildMessageEventQueue({
                type: Events.MessageUpdate,
                guildId: newMessage.guildId,
                dataToStore: data,
            })
        } catch (error) {
            console.error('Error processing MessageUpdate event:', error)
        }
    },
}
