import { QueueFactory } from './index';

export const guildMessageQueue = QueueFactory.createQueue('guildMessageQueue')

export const addGuildMessageQueue = (args: object): void => {
    void guildMessageQueue.add('guildMessageQueue', args, {
        removeOnComplete: {
            age: 3 * 3600, 
        },
        removeOnFail: {
            age: 7 * 24 * 3600, 
        },
    })
}
