import { type Snowflake } from 'discord.js'
import { QueueFactory } from './index'

export const directMessageQueue = QueueFactory.createQueue('directMessageQueue')

export const addDirectMessage = (discordId: Snowflake, info: object): void => {
    void directMessageQueue.add(
        'directMessageQueue',
        { discordId, info },
        {
            removeOnComplete: {
                age: 1 * 24 * 3600, // keep up to 1 day
                count: 1000, // keep up to 1000 jobs
            },
            removeOnFail: {
                age: 7 * 24 * 3600, // keep up to 7 days
            },
        }
    )
}
