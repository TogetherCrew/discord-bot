import { platformService } from '../database/services';
import { addGuildExtraction } from '../queue/queues/guildExtraction';

import parentLogger from '../config/logger';

const logger = parentLogger.child({ event: 'CronJob' });

/**
 * Runs the extraction process for multiple guilds.
 */
export default async function cronJob(): Promise<void> {
  logger.info('event is running');
  const platforms = await platformService.getPlatforms({ disconnectedAt: null });
  for (let i = 0; i < platforms.length; i++) {
    try {
      console.log('cron', i);

      logger.info({ platform_Id: platforms[i].metadata?.id }, 'is running cronJob for platform');
      addGuildExtraction(platforms[i]);
      logger.info({ platform_Id: platforms[i].metadata?.id }, 'cronJob is done for platform');
    } catch (err) {
      logger.error({ platform_Id: platforms[i].metadata?.id, err }, 'CronJob Failed for platform');
    }
  }
  logger.info('event is done');
}
