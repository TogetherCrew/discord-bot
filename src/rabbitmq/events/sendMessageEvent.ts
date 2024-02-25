import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger';
import { platformService } from '../../database/services';
import { addDirectMessage } from '../../queue/queues/directMessage';

const logger = parentLogger.child({
  module: `${Event.DISCORD_BOT.SEND_MESSAGE}`,
});

export async function handleSendMessageEvent(msg: any): Promise<void> {
  try {
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is running');
    if (msg === undefined || msg === null) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
    const platformId = saga.data.platformId;
    const platform = await platformService.getPlatform({ _id: platformId });
    const discordId = saga.data.discordId;
    const message = saga.data.message;
    const useFallback = saga.data.useFallback;
    const info = saga.data.info;
    logger.info({ saga: saga.data }, 'LALA');

    if (Array.isArray(info)) {
      if (platform !== null) {
        await saga.next(async () => {
          for await (const element of info) {
            addDirectMessage(element.discordId, {
              guildId: platform.metadata?.id,
              message: element.message,
              useFallback,
            });
          }
        });
      }
    } else if (typeof discordId === 'string') {
      if (platform !== null) {
        await saga.next(async () => {
          addDirectMessage(discordId, {
            guildId: platform.metadata?.id,
            message,
            useFallback,
          });
        });
      }
    } else {
      throw new Error('Type of discordId is not valid');
    }
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is done');
  } catch (error) {
    logger.error({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid, error }, 'is failed');
  }
}
