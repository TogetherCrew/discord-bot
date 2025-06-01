import { SlashCommandBuilder } from 'discord.js'

import parentLogger from '../../config/logger'
import { interactionService } from '../../services'
import { TemporalClientManager } from '../../services/temporal.service'
// import RabbitMQ, { Event, , TemporalClientManagerQueue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker'
import { ChatInputCommandInteraction_broker } from '../../types/hivemind.type'

const logger = parentLogger.child({ command: 'question' })

export default {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Ask a question and get an answer from Hivemind!')
        .addStringOption((option) =>
            option.setName('question').setDescription('Your question to Hivemind').setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction_broker) {
        logger.info({ interaction_id: interaction.id, user: interaction.user }, 'question command started')
        try {
            const temporalClient = await TemporalClientManager.getInstance().getClient()
            const workflowId = `discord:question:${interaction.id}`
            await temporalClient.workflow.start('DiscordQuestionWorkflow', {
                taskQueue: 'TEMPORAL_QUEUE_HEAVY',
                args: [{ interaction: { ...interaction, token: interaction.token } }],
                workflowId,
            })

            logger.info({ workflowId }, 'question commandd workflow started')

            await interactionService.createInteractionResponse(interaction, {
                type: 5,
                // data: { flags: 64 },
            })

            logger.info({ workflowId }, 'question command workflow created response')

            // RabbitMQ.publish(
            //     RabbitMQQueue.DISCORD_HIVEMIND_ADAPTER,
            //     Event.DISCORD_HIVEMIND_ADAPTER.QUESTION_COMMAND_RECEIVED,
            //     {
            //         interaction: {
            //             token: interaction.token,
            //             ...interaction,
            //         },
            //     }
            // )
        } catch (error) {
            logger.error(error, 'question command failed')
            await interactionService.createInteractionResponse(interaction, {
                type: 4,
                data: {
                    content:
                        "Sorry, we couldn't process your request at the moment. Please report this issue to the TogetherCrew development team. Thank you for your patience!",
                    // flags: 64,
                },
            })
        }
    },
}
