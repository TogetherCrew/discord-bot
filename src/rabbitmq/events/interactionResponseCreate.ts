import { Event } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker, InteractionResponse } from '../../interfaces/Hivemind.interface';
import { interactionService } from '../../services';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: `${Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE}` });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleInteractionResponseCreate(msg: any) {
    try {
        logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE, }, 'is running');
        // const interaction: ChatInputCommandInteraction_broker = JSON.parse(msg?.content.interaction);
        // const data: InteractionResponse = JSON.parse(msg?.content.data);


        const interaction = msg?.content.interaction;
        const data = msg?.content.data;

        console.log(interaction)

        console.log(data)

        await interactionService.createInteractionResponse(interaction, data);
        logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE }, 'is done');
    } catch (error) {
        console.log(error)
        logger.error({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE, error }, 'is failed');
    }
}