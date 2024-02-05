import { Event } from '@togethercrew.dev/tc-messagebroker'
import { interactionService } from '../../services'
import parentLogger from '../../config/logger'
const logger = parentLogger.child({
  module: `${Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE}`,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleInteractionResponseCreate(msg: any): Promise<void> {
  try {
    logger.info(
      { msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE },
      'is running'
    )
    const interaction = msg?.content.interaction
    const data = msg?.content.data
    await interactionService.createInteractionResponse(interaction, data)
    logger.info(
      { msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE },
      'is done'
    )
  } catch (error) {
    logger.error(
      { msg, event: Event.DISCORD_BOT.INTERACTION_RESPONSE.CREATE, error },
      'is failed'
    )
  }
}
