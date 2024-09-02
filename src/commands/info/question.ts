/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from 'discord.js';
import { interactionService, moduleService, platformService } from '../../services';
import RabbitMQ, { Event, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { type ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interface';
import { handleBigInts, removeCircularReferences } from '../../utils/obj';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ command: 'question' });

export default {
  data: new SlashCommandBuilder()
    .setName('question')
    .setDescription('Ask a question and get an answer from Hivemind!')
    .addStringOption((option) =>
      option.setName('question').setDescription('Your question to Hivemind').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction_broker) {
    try {
      const platform = await platformService.getPlatformByFilter({
        name: 'discord',
        'metadata.id': interaction.guildId,
      });
      const hivemindDiscordPlatform = await moduleService.getModuleByFilter({
        'options.platforms': {
          $elemMatch: {
            name: 'discord',
            platform: platform?.id,
          },
        },
      });
      if (!hivemindDiscordPlatform) {
        return await interactionService.createInteractionResponse(interaction, {
          type: 4,
          data: {
            content:
              'The **/question** command uses TogetherCrew Hivemind AI to help answer questions about your community.\nTo enable this feature, ask your community manager to configure the Hivemind module on [togethercrew app](https://app.togethercrew.com).\n**Note**: once configured, it can take up to 24 hours for Hivemind to start working.',
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
      logger.error(error, 'is failed');
    }
  },
};
