import { Event } from '@togethercrew.dev/tc-messagebroker'
import { interactionService } from '../../services'
import parentLogger from '../../config/logger'
const logger = parentLogger.child({
    module: `${Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT}`,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleInteractionResponseEdit(msg: any): Promise<void> {
    try {
        // logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT }, 'is running');
        const interaction = msg?.content.interaction
        const data = msg?.content.data

        if (typeof data.content === 'string' && data.content.length > 2000) {
            // Split content into paragraphs
            const paragraphs = data.content.split('\n\n')
            let currentMessage = ''
            const messages = []

            // Group paragraphs into messages under 2000 chars
            for (const paragraph of paragraphs) {
                if ((currentMessage + '\n\n' + paragraph).length <= 2000) {
                    currentMessage = currentMessage ? currentMessage + '\n\n' + paragraph : paragraph
                } else {
                    messages.push({ ...data, content: currentMessage })
                    currentMessage = paragraph
                }
            }
            if (currentMessage) {
                messages.push({ content: currentMessage })
            }

            // Send first message as edit to original
            await interactionService.editOriginalInteractionResponse(interaction, messages[0])

            // Send remaining messages as follow-ups
            for (let i = 1; i < messages.length; i++) {
                await interactionService.createFollowUpMessage(interaction, messages[i])
            }
        } else {
            await interactionService.editOriginalInteractionResponse(interaction, data)
        }

        await interactionService.editOriginalInteractionResponse(interaction, data)
        // logger.info({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT }, 'is done');
    } catch (error) {
        logger.error({ msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.EDIT, error }, 'is failed')
    }
}
