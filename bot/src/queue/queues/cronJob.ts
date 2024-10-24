import { QueueFactory } from './index'
import { cronJobRepeatConfig } from '../../config/queue'

export const cronJobQueue = QueueFactory.createQueue('cronJobQueue')

export const addCronJob = (): void => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    void cronJobQueue.add('cronJob', {}, {
        repeat: cronJobRepeatConfig,
        removeOnComplete: {
            age: 365 * 24 * 3600, // keep up to 365 days
            count: 365, // keep up to 365 jobs
        },
        removeOnFail: {
            age: 365 * 24 * 3600, // keep up to 365 days
        },
    } as never)
}
