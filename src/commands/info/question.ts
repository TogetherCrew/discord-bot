/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from 'discord.js';
import { interactionService } from '../../services';
import RabbitMQ, { Event, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { type ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interface';
import { handleBigInts, removeCircularReferences } from '../../utils/obj';
import logger from '../../config/logger';
export default {
  data: new SlashCommandBuilder()
    .setName('question')
    .setDescription('Ask a question and get an answer from Hivemind!')
    .addStringOption((option) =>
      option.setName('question').setDescription('Your question to Hivemind').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction_broker) {
    try {
      // TogetherCrew-Leads: 983364577096003604  TogetherCrew-Contributors: 983364691692748832
      if (
        !(
          interaction.member?.roles.cache.has('983364577096003604') ||
          interaction.member?.roles.cache.has('983364691692748832')
        )
      ) {
        return await interactionService.createInteractionResponse(interaction, {
          type: 4,
          data: {
            content: 'You do not have the required role to use this command!',
            flags: 64,
          },
        });
      }
      const serializedInteraction = interactionService.constructSerializableInteraction(interaction);
      const processedInteraction = handleBigInts(serializedInteraction);
      const cleanInteraction = removeCircularReferences(processedInteraction); // Pass processedInteraction here
      const serializedData = JSON.stringify(cleanInteraction, null, 2);
      RabbitMQ.publish(RabbitMQQueue.HIVEMIND, Event.HIVEMIND.INTERACTION_CREATED, { interaction: serializedData });
      await interactionService.createInteractionResponse(interaction, {
        type: 5,
        data: { flags: 64 },
      });
    } catch (error) {
      logger.error({ command: 'question', error }, 'is failed');
    }
  },
};
