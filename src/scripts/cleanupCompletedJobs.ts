import 'dotenv/config';
import { userEventQueue } from '../queue/queues/userEvent';
import { guildExtractionQueue } from '../queue/queues/guildExtraction';
import { guildEventQueue } from '../queue/queues/guildEvent';
import { directMessageQueue } from '../queue/queues/directMessage';
import { cronJobQueue } from '../queue/queues/cronJob';
import { channelMessageQueue } from '../queue/queues/channelMessage';
import parentLogger from '../config/logger';
const logger = parentLogger.child({ module: `cleanupCompletedJobs` });

/**
 * Cleans up all completed jobs from queues
 */
async function cleanAllCompletedJobs(): Promise<void> {
  try {
    const deletedUserEventJobIds = await userEventQueue.clean(0, 1000000000, 'completed');
    const deletedGuildExtractionJobIds = await guildExtractionQueue.clean(0, 1000000000, 'completed');
    const deletedDirectMessageJobIds = await directMessageQueue.clean(0, 1000000000, 'completed');
    const deletedChannelMessageJobIds = await channelMessageQueue.clean(0, 1000000000, 'completed');
    const deletedCronJobJobIds = await cronJobQueue.clean(0, 1000000000, 'completed');
    const deletedGuildEventJobIds = await guildEventQueue.clean(0, 1000000000, 'completed');
    logger.info(`All GuildEvent completed jobs cleaned: ${deletedGuildEventJobIds.length} jobs removed.`);
    logger.info(`All CronJob completed jobs cleaned: ${deletedCronJobJobIds.length} jobs removed.`);
    logger.info(`All ChannelMessage completed jobs cleaned: ${deletedChannelMessageJobIds.length} jobs removed.`);
    logger.info(`All DirectMessage completed jobs cleaned: ${deletedDirectMessageJobIds.length} jobs removed.`);
    logger.info(`All GuildExtraction completed jobs cleaned: ${deletedGuildExtractionJobIds.length} jobs removed.`);
    logger.info(`All UserEvent completed jobs cleaned: ${deletedUserEventJobIds.length} jobs removed.`);
  } catch (error) {
    logger.error('Failed to clean all completed jobs', error);
  }
}

cleanAllCompletedJobs().catch((error) => {
  logger.error('Unhandled exception in cleanup jobs', error);
});
