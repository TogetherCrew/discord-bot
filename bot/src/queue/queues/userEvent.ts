import { QueueFactory } from './index'

export const userEventQueue = QueueFactory.createQueue('userEventQueue')

export const addUserEventQueue = (args: object): void => {
    void userEventQueue.add('userEventQueue', args, {
        removeOnComplete: {
            age: 3 * 3600, // keep up to 3 hours
            count: 2000, // keep up to 2000 jobs
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // keep up to 7 days
        },
    })
}
