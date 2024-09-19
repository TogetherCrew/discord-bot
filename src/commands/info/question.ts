/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from 'discord.js';
import { interactionService, moduleService, platformService } from '../../services';
import RabbitMQ, { Event, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { type ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interface';
import { handleBigInts, removeCircularReferences } from '../../utils/obj';
import parentLogger from '../../config/logger';
import { performance } from 'perf_hooks';
import { ModuleNames } from '@togethercrew.dev/db';

const logger = parentLogger.child({ command: 'question' });

export default {
  data: new SlashCommandBuilder()
    .setName('question')
    .setDescription('Ask a question and get an answer from Hivemind!')
    .addStringOption((option) =>
      option.setName('question').setDescription('Your question to Hivemind').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction_broker) {
    const start = performance.now(); // Start high-resolution timer
    logger.info({ interaction_id: interaction.id, user: interaction.user }, 'question command started');

    try {
      const stage1Start = performance.now(); // Start time for deferred interaction response
      await interactionService.createInteractionResponse(interaction, {
        type: 5,
        data: { flags: 64 },
      });
      const stage1End = performance.now();
      logger.info({ interaction_id: interaction.id }, `Deferred response took ${stage1End - stage1Start} ms`);

      // Platform fetch stage
      const stage2Start = performance.now(); // Start time for platform check
      const platform = await platformService.getPlatformByFilter({
        name: 'discord',
        'metadata.id': interaction.guildId,
      });
      const stage2End = performance.now();
      logger.info({ interaction_id: interaction.id }, `Platform fetch took ${stage2Start - stage2End} ms`);

      // Hivemind check stage
      const stage3Start = performance.now(); // Start time for Hivemind check
      const hivemindDiscordPlatform = await moduleService.getModuleByFilter({
        name: ModuleNames.Hivemind,
        'options.platforms': {
          $elemMatch: {
            name: 'discord',
            platform: platform?.id,
          },
        },
      });
      const stage3End = performance.now();
      logger.info({ interaction_id: interaction.id }, `Hivemind check took ${stage3End - stage3Start} ms`);

      console.log(hivemindDiscordPlatform, platform);
      // Hivemind not found, return response
      if (!hivemindDiscordPlatform) {
        const stage4Start = performance.now(); // Start time for interaction response
        // await interactionService.createInteractionResponse(interaction, {
        //   type: 4,
        //   data: {
        //     content:
        //       'The **/question** command uses TogetherCrew Hivemind AI to help answer questions about your community.\nTo enable this feature, ask your community manager to configure the Hivemind module on [togethercrew app](https://app.togethercrew.com).\n**Note**: once configured, it can take up to 24 hours for Hivemind to start working.',
        //     flags: 64,
        //   },
        // });
        await interactionService.editOriginalInteractionResponse(interaction, {
          content:
            'The **/question** command uses TogetherCrew Hivemind AI to help answer questions about your community.\nTo enable this feature, ask your community manager to configure the Hivemind module on [togethercrew app](https://app.togethercrew.com).\n**Note**: once configured, it can take up to 24 hours for Hivemind to start working.',
        });
        const stage4End = performance.now();
        logger.info({ interaction_id: interaction.id }, `Response creation took ${stage4End - stage4Start} ms`);
        return;
      }

      // const stage4Start = performance.now(); // Start time for deferred interaction response
      // await interactionService.createInteractionResponse(interaction, {
      //   type: 5,
      //   data: { flags: 64 },
      // });
      // const stage4End = performance.now();
      // logger.info({ interaction_id: interaction.id }, `Deferred response took ${stage4End - stage4Start} ms`);

      // Interaction processing stage
      const stage5Start = performance.now(); // Start time for interaction processing
      const serializedInteraction = interactionService.constructSerializableInteraction(interaction);
      const processedInteraction = handleBigInts(serializedInteraction);
      const cleanInteraction = removeCircularReferences(processedInteraction);
      const serializedData = JSON.stringify(cleanInteraction, null, 2);
      RabbitMQ.publish(RabbitMQQueue.HIVEMIND, Event.HIVEMIND.INTERACTION_CREATED, { interaction: serializedData });
      const stage5End = performance.now();
      logger.info({ interaction_id: interaction.id }, `Interaction processing took ${stage5End - stage5Start} ms`);

      logger.info({ interaction_id: interaction.id, user: interaction.user }, `question command ended`);
      logger.info(`Total execution time: ${performance.now() - start} ms`);
    } catch (error) {
      logger.error(error, 'question command failed');
      await interactionService.createInteractionResponse(interaction, {
        type: 4,
        data: {
          content:
            "Sorry, we couldn't process your request at the moment. Please report this issue to the TogetherCrew development team. Thank you for your patience!",
          flags: 64,
        },
      });
      logger.info(`Error handling time: ${performance.now() - start} ms`);
    }
  },
};
