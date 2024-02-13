import { Worker } from 'bullmq';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: 'Queue' });

export class WorkerFactory {
  static attachEventListeners(worker: Worker) {
    worker.on('completed', (job) => {
      logger.info({ job }, 'Job is done');
    });

    worker.on('failed', (job, error) => {
      logger.error({ job, error }, 'Job failed');
    });
  }
}
