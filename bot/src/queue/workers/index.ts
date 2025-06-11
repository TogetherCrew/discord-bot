/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Worker } from 'bullmq'
import { HydratedDocument } from 'mongoose'

import { IPlatform } from '@togethercrew.dev/db'

import parentLogger from '../../config/logger'
import { airflowService } from '../../services'

const logger = parentLogger.child({ module: 'Queue' })

export class WorkerFactory {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    static attachEventListeners(worker: Worker) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        worker.on('completed', async (job: any) => {
            if (worker.name === 'guildExtractionQueue') {
                try {
                    const platform = job.data.platform as HydratedDocument<IPlatform>
                    const recompute = job.data.recompute
                    const res = await airflowService.triggerDag({
                        platform_id: platform.id,
                        guild_id: platform.metadata?.id,
                        period: platform.metadata?.period,
                        recompute,
                    })
                    logger.info({ jobId: job.id, res, recompute, platform }, 'Guild extraction job completed')
                } catch (err) {
                    logger.error({ job, err }, 'triggerDag failed')
                }
            } else {
                logger.info({ jobId: job.id }, 'Job completed')
            }
        })

        worker.on('failed', (job, error) => {
            logger.error({ job, error }, 'Job failed')
        })
    }
}
