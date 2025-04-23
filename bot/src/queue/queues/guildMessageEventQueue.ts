import { QueueFactory } from './index'

export const guildMessageEventQueue = QueueFactory.createQueue('guildMessageEventQueue')

export const addGuildMessageEventQueue = (args: object): void => {
    void guildMessageEventQueue.add('guildMessageEventQueue', args, {
        removeOnComplete: {
            age: 3 * 3600,
        },
        removeOnFail: {
            age: 7 * 24 * 3600,
        },
    })
}
