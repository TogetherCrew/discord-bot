import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger';
import { channelService } from '../../services';
import { addChannelMessage } from '../../queue/queues/channelMessage'
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.SEND_MESSAGE}` });

export async function handleSendMessageToChannel(msg: any) {
    try {
        logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE_TO_CHANNEL, sagaId: msg.content.uuid }, 'is running');
        if (!msg) return;

        const { content } = msg;
        const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
        const channels = saga.data['channels'];
        const message = saga.data['message'];

        // IS THIS CORRECT WAY?
        await saga.next(async () => {
            for await (const channel of channels) {
                addChannelMessage(channel, message)
            }
        });

        logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE_TO_CHANNEL, sagaId: msg.content.uuid }, 'is done');
    } catch (error) {
        logger.error({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE_TO_CHANNEL, sagaId: msg.content.uuid, error }, 'is failed');

    }
}