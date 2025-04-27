import { Events, Message, Snowflake } from 'discord.js'

import { rawInfoService } from '../../database/services'
import { addGuildMessageEventQueue } from '../../queue/queues/guildMessageEventQueue'

interface threadInfo {
    threadId: Snowflake
    threadName: string
    channelId: Snowflake | undefined
    channelName: string | undefined
}
export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        let threadInfo: threadInfo | undefined
        if (!message.guildId) return
        if (message.channel.isThread()) {
            threadInfo = {
                threadId: message.channel.id,
                threadName: message.channel.name,
                channelId: message.channel.id,
                channelName: message.channel.parent?.name,
            }
        }
        try {
            const data = await rawInfoService.getNeedDataFromMessage(message, threadInfo)
            addGuildMessageEventQueue({
                type: Events.MessageCreate,
                guildId: message.guildId,
                dataToStore: data,
            })
        } catch (error) {
            console.error('Error processing MessageCreate event:', error)
        }
    },
}
