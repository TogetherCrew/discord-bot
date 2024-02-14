import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import parentLogger from '../../config/logger';
import { platformService } from '../../database/services';
import { userService } from '../../services';
const logger = parentLogger.child({
  module: `${Event.DISCORD_BOT.SEND_MESSAGE}`,
});

export async function handleSendMessageEvent(msg: any): Promise<void> {
  try {
    // logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is running');
    if (msg === undefined || msg === null) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({ sagaId: content.uuid });
    const platformId = saga.data.platformId;
    const platform = await platformService.getPlatform({ _id: platformId });
    const discordId = saga.data.discordId;
    const message = saga.data.message;
    const useFallback = saga.data.useFallback;
    if (platform !== null) {
      await saga.next(async () =>
        userService.notifyUserAboutAnalysisFinish(discordId, {
          guildId: platform.metadata?.id,
          message,
          useFallback,
        }),
      );
    }

    // logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is done');
  } catch (error) {
    logger.error({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid, error }, 'is failed');
  }
}
