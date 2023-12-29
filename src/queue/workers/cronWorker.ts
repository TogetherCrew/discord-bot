import { Worker, Job } from 'bullmq';
import { redisConfig } from '../../config/queue';
import cronJob from '../../functions/cronJon';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: 'Queue' });

export const cronWorker = new Worker(
    'cronJobQueue',
    async (job: Job<any, any, string> | undefined) => {
        if (job) {
            await cronJob();
        }
    },
    {
        connection: redisConfig,
        lockDuration: 79200000, // 22 hours
    }
);

// Event listeners
cronWorker.on('completed', job => {
    logger.info({ job }, 'Job is done');
});

cronWorker.on('failed', (job, error) => {
    logger.error({ job, error }, 'Job failed');
});