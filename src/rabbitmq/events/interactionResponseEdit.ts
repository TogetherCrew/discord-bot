import { Event } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker, InteractionResponseEditData } from '../../interfaces/Hivemind.interface';
import { interactionService } from '../../services';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT}` });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleInteractionResponseEdit(msg: any) {
    try {
        logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT }, 'is running');
        // const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
        // const data: InteractionResponseEditData = JSON.parse(msg?.content.data);

        const interaction = msg?.content.interaction;
        const data = msg?.content.data;

        await interactionService.editOriginalInteractionResponse(interaction, data)
        logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT }, 'is done');
    } catch (error) {
        logger.error({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT, error }, 'is failed');
    }
}