import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import { DatabaseManager } from '@togethercrew.dev/db';
import fetchMembers from '../../functions/fetchMembers';
import fetchChannels from '../../functions/fetchChannels';
import fetchRoles from '../../functions/fetchRoles';
import guildExtraction from '../../functions/guildExtraction';
import parentLogger from '../../config/logger';
import { platformService } from '../../database/services';
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.FETCH}` });


const fetchMethod = async (msg: any) => {

    logger.info({ msg }, 'fetchMethod is running');
    if (!msg) return;
    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
    logger.info({ saga: saga.data }, 'the saga info');
    const platformId = saga.data['platformId'];
    const platform = await platformService.getPlatform({ _id: platformId });

    if (platform) {
        const isPlatformCreated = saga.data['created'];
        const connection = await DatabaseManager.getInstance().getTenantDb(platform.metadata?.id);
        if (isPlatformCreated) {
            await fetchChannels(connection, platform);
            await fetchMembers(connection, platform);
            await fetchRoles(connection, platform);
        } else {
            await guildExtraction(connection, platform);
        }
    }
    logger.info({ msg }, 'fetchMethod is done');
};

export async function handleFetchEvent(msg: any) {
    try {
        logger.info({ msg, event: Event.DISCORD_BOT.FETCH, sagaId: msg.content.uuid }, 'is running');
        if (!msg) return;

        const { content } = msg;
        const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
        await saga.next(() => fetchMethod(msg));
        logger.info({ msg, event: Event.DISCORD_BOT.FETCH, sagaId: msg.content.uuid }, 'is done');
    } catch (error) {
        logger.error({ msg, event: Event.DISCORD_BOT.FETCH, sagaId: msg.content.uuid, error }, 'is failed');

    }
}