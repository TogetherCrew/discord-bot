import { DatabaseManager, type IPlatform } from '@togethercrew.dev/db';
import { type HydratedDocument } from 'mongoose';
import fetchMembers from '../../functions/fetchMembers';
import fetchChannels from '../../functions/fetchChannels';
import fetchRoles from '../../functions/fetchRoles';
import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger';
import { platformService } from '../../database/services';

const logger = parentLogger.child({
  module: `${Event.DISCORD_BOT.FETCH_MEMBERS}`,
});

const fetchInitialData = async (platform: HydratedDocument<IPlatform>): Promise<void> => {
  try {
    const connection = await DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
    await fetchChannels(connection, platform);
    await fetchRoles(connection, platform);
    await fetchMembers(connection, platform);
  } catch (error) {
    logger.error({ error }, 'fetchInitialData is failed');
  }
};

export async function handleFetchMembersEvent(msg: any): Promise<void> {
  try {
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS, sagaId: msg.content.uuid }, 'is running');
    if (msg === undefined || msg === null) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({
      sagaId: content.uuid,
    });

    const platformId = saga.data.platformId;

    const platform = await platformService.getPlatform({ _id: platformId });

    logger.info({ platformId, platform }, 'platform info');

    if (platform !== null) {
      const fn = fetchInitialData.bind({}, platform);
      await saga.next(fn);
    }
    logger.info({ msg, event: Event.DISCORD_BOT.FETCH_MEMBERS, sagaId: msg.content.uuid }, 'is done');
  } catch (error) {
    logger.error(
      {
        msg,
        event: Event.DISCORD_BOT.FETCH_MEMBERS,
        sagaId: msg.content.uuid,
        error,
      },
      'is failed',
    );
  }
}
