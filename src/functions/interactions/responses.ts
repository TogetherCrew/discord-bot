import fetch from 'node-fetch';
import parentLogger from '../../config/logger';
import { ChatInputCommandInteraction } from 'discord.js';

const logger = parentLogger.child({ module: 'InteractionResponses' });


/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
export async function createInteractionResponse(interaction: ChatInputCommandInteraction, type: number, data: object) {
    try {
        // {4, 5, 9, 10, 11}
        const body = {
            type,
            data
        };
        const response = await fetch(`https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
            throw new Error(await response.json());
        }
    } catch (error) {
        logger.error({ interaction_id: interaction.id, interaction_token: interaction.token, error }, 'Failed to send interaction response');
    }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
export async function getOriginalInteractionResponse(interaction: ChatInputCommandInteraction) {
    try {
        const response = await fetch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
            return await response.json();
        }
        else {
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
export async function editOriginalInteractionResponse(interaction: ChatInputCommandInteraction, data: object) {
    try {
        const response = await fetch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
            return await response.json();
        }
        else {
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
export async function deleteOriginalInteractionResponse(interaction: ChatInputCommandInteraction) {
    try {
        const response = await fetch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'DELETE',
            // headers: { 'Content-Type': 'application/json' }
        })
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
export async function createFollowUpMessage(interaction: ChatInputCommandInteraction, data: object) {
    try {
        const response = await fetch(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error(await response.json());
        }
    } catch (error) {
        logger.error({ interaction_id: interaction.id, interaction_token: interaction.token, error }, 'Failed to send interaction response');
    }
}
