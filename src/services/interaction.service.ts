/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch';
import parentLogger from '../config/logger';
import {
  ChatInputCommandInteraction_broker,
  InteractionResponse,
  InteractionResponseEditData,
} from '../interfaces/Hivemind.interface';

const logger = parentLogger.child({ module: 'InteractionResponses' });

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createInteractionResponse(interaction: ChatInputCommandInteraction_broker, data: InteractionResponse) {
  try {
    // {4, 5, 9, 10, 11}
    const { type, ...rest } = data;
    const body = {
      type: type,
      data: rest.data,
    };

    const response = await fetch(
      `https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error();
    }
  } catch (error) {
    logger.error(
      { interaction_id: interaction.id, interaction_token: interaction.token, error },
      'Failed to send interaction response',
    );
  }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function getOriginalInteractionResponse(interaction: ChatInputCommandInteraction_broker) {
  try {
    const response = await fetch(
      `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(await response.json());
    }
  } catch (error) {
    logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
  }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function editOriginalInteractionResponse(
  interaction: ChatInputCommandInteraction_broker,
  data: InteractionResponseEditData,
) {
  try {
    const response = await fetch(
      `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(await response.json());
    }
  } catch (error) {
    logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
  }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function deleteOriginalInteractionResponse(interaction: ChatInputCommandInteraction_broker) {
  try {
    const response = await fetch(
      `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
      {
        method: 'DELETE',
        // headers: { 'Content-Type': 'application/json' }
      },
    );
    if (!response.ok) {
      throw new Error(await response.json());
    }
  } catch (error) {
    logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
  }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createFollowUpMessage(interaction: ChatInputCommandInteraction_broker, data: object) {
  try {
    const response = await fetch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(await response.json());
    }
  } catch (error) {
    logger.error(
      { interaction_id: interaction.id, interaction_token: interaction.token, error },
      'Failed to create followip message',
    );
  }
}

function constructSerializableInteraction(
  interaction: ChatInputCommandInteraction_broker,
): ChatInputCommandInteraction_broker {
  return {
    id: interaction.id,
    applicationId: interaction.applicationId,
    type: interaction.type,
    guildId: interaction.guildId,
    guild: interaction.guild,
    channel: interaction.channel,
    channelId: interaction.channelId,
    token: interaction.token,
    user: interaction.user,
    createdAt: interaction.createdAt,
    deferred: interaction.deferred,
    replied: interaction.replied,
    webhook: interaction.webhook,
    member: interaction.member,
    ephemeral: interaction.ephemeral,
    createdTimestamp: interaction.createdTimestamp,
    appPermissions: interaction.appPermissions as any,
    memberPermissions: interaction.memberPermissions as any,
    locale: interaction.locale,
    guildLocale: interaction.guildLocale,
    client: interaction.client,
    command: interaction.command,
    commandId: interaction.commandId,
    commandName: interaction.commandName,
    commandType: interaction.commandType,
    commandGuildId: interaction.commandGuildId,
    options: interaction.options,
    version: interaction.version,
  };
}

export default {
  createInteractionResponse,
  getOriginalInteractionResponse,
  editOriginalInteractionResponse,
  deleteOriginalInteractionResponse,
  createFollowUpMessage,
  constructSerializableInteraction,
};
