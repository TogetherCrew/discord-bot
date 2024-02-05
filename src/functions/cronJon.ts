import { type Types } from 'mongoose';
import { platformService } from '../database/services';
import { ChoreographyDict, MBConnection, Status } from '@togethercrew.dev/tc-messagebroker';
import guildExtraction from './guildExtraction';
import parentLogger from '../config/logger';
import { DatabaseManager } from '@togethercrew.dev/db';

const logger = parentLogger.child({ event: 'CronJob' });

async function createAndStartCronJobSaga(platformId: Types.ObjectId): Promise<void> {
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

/**
 * Runs the extraction process for multiple guilds.
 */
export default async function cronJob(): Promise<void> {
  logger.info('event is running');
  const platforms = await platformService.getPlatforms({ disconnectedAt: null });
  for (let i = 0; i < platforms.length; i++) {
    const connection = await DatabaseManager.getInstance().getTenantDb(platforms[i].metadata?.id);
    try {
      logger.info({ platform_Id: platforms[i].metadata?.id }, 'is running cronJob for platform');
      await guildExtraction(connection, platforms[i]);
      await createAndStartCronJobSaga(platforms[i].id);
      logger.info({ platform_Id: platforms[i].metadata?.id }, 'cronJob is done for platform');
    } catch (err) {
      logger.error({ platform_Id: platforms[i].metadata?.id, err }, 'CronJob Failed for platform');
    }
  }
  logger.info('event is done');
}
