import { Event } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker, FollowUpMessageData } from '../../interfaces/Hivemind.interface';
import { interactionService } from '../../services';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE}` });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleFollowUpMessageCreate(msg: any) {
  try {
    logger.info({ msg, event: Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE }, 'is running');
    // const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
    // const data: FollowUpMessageData = JSON.parse(msg?.content.data);

    const interaction = msg?.content.interaction;
    const data = msg?.content.data;

    await interactionService.createFollowUpMessage(interaction, data);
    logger.info({ msg, event: Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE }, 'is done');
  } catch (error) {
    logger.error({ msg, event: Event.DISCORD_BOT.FOLLOWUP_MESSAGE.CREATE, error }, 'is failed');
  }
}
