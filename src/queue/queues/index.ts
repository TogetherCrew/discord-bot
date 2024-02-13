import { Queue } from 'bullmq';
import { redisConfig } from '../../config/queue';

export class QueueFactory {
    static createQueue(name: string): Queue {
        return new Queue(name, { connection: redisConfig });
    }
}