import { Client, Snowflake } from 'discord.js';
import { guildService } from '../database/services';
import { ChoreographyDict, MBConnection, Status } from '@togethercrew.dev/tc-messagebroker';
import guildExtraction from './guildExtraction';
import parentLogger from '../config/logger';
import { DatabaseManager } from '@togethercrew.dev/db';

const logger = parentLogger.child({ event: 'CronJob' });

async function createAndStartCronJobSaga(guildId: Snowflake) {
  try {
    const saga = await MBConnection.models.Saga.create({
      status: Status.NOT_STARTED,
      data: { guildId },
      choreography: ChoreographyDict.DISCORD_SCHEDULED_JOB,
    });
    await saga.start();
  } catch (err) {
    logger.error({ guild_Id: guildId, err }, 'Faield to create saga');
  }
}

/**
 * Runs the extraction process for multiple guilds.
 * @param {Client} client - The discord.js client object used to fetch the guilds.
 */
export default async function cronJob(client: Client) {
  logger.info('event is running');
  const guilds = await guildService.getGuilds({ isDisconnected: false });
  for (let i = 0; i < guilds.length; i++) {
    const connection = DatabaseManager.getInstance().getTenantDb(guilds[i].guildId);
    try {
      logger.info({ guild_id: guilds[i].guildId }, 'is running cronJob for guild');
      await guildExtraction(connection, client, guilds[i].guildId);
      await createAndStartCronJobSaga(guilds[i].guildId);
      logger.info({ guild_id: guilds[i].guildId }, 'cronJob is done for guild');
    } catch (err) {
      logger.error({ guild_id: guilds[i].guildId, err }, 'CronJob faield for guild');
    }

  }
  logger.info('event is done');
}
