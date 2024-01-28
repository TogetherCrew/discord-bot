import { Event } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interface';
import { interactionService } from '../../services';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE}` });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleInteractionResponseDelete(msg: any) {
  try {
    logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE }, 'is running');
    // const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);

    const interaction = msg?.content.interaction;
    await interactionService.deleteOriginalInteractionResponse(interaction);
    logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE }, 'is done');
  } catch (error) {
    logger.error({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.DELETE, error }, 'is failed');
  }
}
