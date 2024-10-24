import { Queue } from 'bullmq'
import { redisConfig } from '../../config/queue'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QueueFactory {
    static createQueue(name: string): Queue {
        return new Queue(name, { connection: redisConfig })
    }
}
