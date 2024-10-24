import { QueueFactory } from './index'
import { type HydratedDocument } from 'mongoose'
import { type IPlatform } from '@togethercrew.dev/db'

export const guildExtractionQueue = QueueFactory.createQueue('guildExtractionQueue')

export const addGuildExtraction = (platform: HydratedDocument<IPlatform>, recompute: boolean): void => {
    void guildExtractionQueue.add(
        'guildExtractionQueue',
        { platform, recompute },
        {
            removeOnComplete: {
                age: 7 * 24 * 3600, // keep up to 7 days
                count: 1000, // keep up to 1000 jobs
            },
            removeOnFail: {
                age: 30 * 24 * 3600, // keep up to 30 days
            },
        }
    )
}
