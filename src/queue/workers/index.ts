/* eslint-disable @typescript-eslint/no-extraneous-class */
import { type Worker } from 'bullmq';
import parentLogger from '../../config/logger';
import { airflowService } from '../../services';
import { type HydratedDocument } from 'mongoose';
import { type IPlatform } from '@togethercrew.dev/db';

const logger = parentLogger.child({ module: 'Queue' });

export class WorkerFactory {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static attachEventListeners(worker: Worker) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    worker.on('completed', async (job: any) => {
      if (worker.name === 'guildExtractionQueue') {
        const platform = job.data.platform as HydratedDocument<IPlatform>;
        const recompute = job.data.recompute;
        logger.info({ jobId: job.id, platform, recompute }, 'Guild extraction job completed');
        await airflowService.triggerDag({
          platform_id: platform.id,
          guild_id: platform.metadata?.id,
          period: platform.metadata?.period,
          recompute,
        });
      } else {
        logger.info({ jobId: job.id }, 'Job completed');
      }
    });

    worker.on('failed', (job, error) => {
      logger.error({ job, error }, 'Job failed');
    });
  }
}
