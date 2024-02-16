import { type Types } from 'mongoose';
import { ChoreographyDict, MBConnection, Status } from '@togethercrew.dev/tc-messagebroker';

import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'CronJob' });

async function createAndStartDiscordScheduledJobsaga(platformId: Types.ObjectId): Promise<void> {
    try {
        const saga = await MBConnection.models.Saga.create({
            status: Status.NOT_STARTED,
            data: { platformId },
            choreography: ChoreographyDict.DISCORD_SCHEDULED_JOB,
        });
        await saga.start();
    } catch (err) {
        logger.error({ platform_Id: platformId, err }, 'Failed to create saga');
    }
}

export default {
    createAndStartDiscordScheduledJobsaga
}