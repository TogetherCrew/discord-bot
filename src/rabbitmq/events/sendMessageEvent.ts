import { type Channel, ChannelType, type Snowflake, type TextChannel } from 'discord.js';
import { Event, MBConnection } from '@togethercrew.dev/tc-messagebroker';
import { coreService } from '../../services';
import { createPrivateThreadAndSendMessage } from '../../functions/thread';
import parentLogger from '../../config/logger';
import { platformService } from '../../database/services';
import { addDirectMessage } from '../../queue/queues/directMessage';
const logger = parentLogger.child({
  module: `${Event.DISCORD_BOT.SEND_MESSAGE}`,
});

const notifyUserAboutAnalysisFinish = async (
  discordId: string,
  info: { guildId: Snowflake; message: string; useFallback: boolean },
): Promise<void> => {
  const client = await coreService.DiscordBotManager.getClient();

  // related issue https://github.com/RnDAO/tc-discordBot/issues/68
  const { guildId, message, useFallback } = info;

  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  const arrayChannels = Array.from(channels, ([name, value]) => ({ ...value } as Channel));
  const textChannels = arrayChannels.filter((channel) => channel.type === ChannelType.GuildText) as TextChannel[];
  const rawPositionBasedSortedTextChannels = textChannels.sort((textChannelA, textChannelB) =>
    textChannelA.rawPosition > textChannelB.rawPosition ? 1 : -1,
  );
  const upperTextChannel = rawPositionBasedSortedTextChannels[0];

  try {
    addDirectMessage(discordId, message);
  } catch (error) {
    // can not send DM to the user
    // Will create a private thread and notify him/her about the status if useFallback is true
    if (useFallback)
      await createPrivateThreadAndSendMessage(upperTextChannel, {
        threadName: 'TogetherCrew Status',
        message: `<@${discordId}> ${message}`,
      });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleSendMessageEvent(msg: any): Promise<void> {
  try {
    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is running');
    if (msg === undefined || msg === null) return;

    const { content } = msg;
    const saga = await MBConnection.models.Saga.findOne({
      sagaId: content.uuid,
    });
    const platformId = saga.data.platformId;
    const platform = await platformService.getPlatform({ _id: platformId });
    const discordId = saga.data.discordId;
    const message = saga.data.message;
    const useFallback = saga.data.useFallback;
    if (platform !== null) {
      await saga.next(async () =>
        // eslint-disable-next-line @typescript-eslint/return-await
        notifyUserAboutAnalysisFinish(discordId, {
          guildId: platform.metadata?.id,
          message,
          useFallback,
        }),
      );
    }

    logger.info({ msg, event: Event.DISCORD_BOT.SEND_MESSAGE, sagaId: msg.content.uuid }, 'is done');
  } catch (error) {
    logger.error(
      {
        msg,
        event: Event.DISCORD_BOT.SEND_MESSAGE,
        sagaId: msg.content.uuid,
        error,
      },
      'is failed',
    );
  }
}
