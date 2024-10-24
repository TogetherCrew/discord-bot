/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch'
import parentLogger from '../config/logger'
import {
    type ChatInputCommandInteraction_broker,
    type InteractionResponse,
    type InteractionResponseEditData,
} from '../interfaces/Hivemind.interface'

const logger = parentLogger.child({ module: 'InteractionResponses' })

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createInteractionResponse(
    interaction: ChatInputCommandInteraction_broker,
    data: InteractionResponse
): Promise<any> {
    try {
        // {4, 5, 9, 10, 11}
        const { type, ...rest } = data
        const body = {
            type,
            data: rest.data,
        }

        if (interaction.token === null || interaction.token === undefined) {
            throw new Error('InteractionToken is null or undefined')
        }

        const response = await fetch(
            `https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`,
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            }
        )
        if (!response.ok) {
            const errorResponse = await response.text()
            throw new Error(errorResponse)
        }
    } catch (error) {
        logger.error(error, 'Failed to send interaction response')
        logger.error(
            { interaction_id: interaction.id, user: interaction.user },
            'Failed to send interaction response'
        )
    }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function getOriginalInteractionResponse(
    interaction: ChatInputCommandInteraction_broker
): Promise<any> {
    try {
        if (
            interaction.token === null ||
            interaction.token === undefined ||
            interaction.applicationId === null ||
            interaction.applicationId === undefined
        ) {
            throw new Error(
                'InteractionToken or InteractionApplicationId is null or undefined'
            )
        }

        const response = await fetch(
            `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
        )
        if (response.ok) {
            return await response.json()
        } else {
            const errorResponse = await response.text()
            throw new Error(errorResponse)
        }
    } catch (error) {
        logger.error(error, 'Failed to get original interaction response')
        logger.error(
            { interaction_id: interaction.id, user: interaction.user },
            'Failed to get original interaction response'
        )
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
    data: InteractionResponseEditData
): Promise<any> {
    try {
        if (
            interaction.token === null ||
            interaction.token === undefined ||
            interaction.applicationId === null ||
            interaction.applicationId === undefined
        ) {
            throw new Error(
                'InteractionToken or InteractionApplicationId is null or undefined'
            )
        }

        const response = await fetch(
            `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            }
        )
        if (response.ok) {
            return await response.json()
        } else {
            const errorResponse = await response.text()
            throw new Error(errorResponse)
        }
    } catch (error) {
        logger.error(error, 'Failed to edit original interaction response')
        logger.error(
            { interaction_id: interaction.id, user: interaction.user },
            'Failed to edit original interaction response'
        )
    }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function deleteOriginalInteractionResponse(
    interaction: ChatInputCommandInteraction_broker
): Promise<void> {
    try {
        if (
            interaction.token === null ||
            interaction.token === undefined ||
            interaction.applicationId === null ||
            interaction.applicationId === undefined
        ) {
            throw new Error(
                'InteractionToken or InteractionApplicationId is null or undefined'
            )
        }

        const response = await fetch(
            `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`,
            {
                method: 'DELETE',
                // headers: { 'Content-Type': 'application/json' }
            }
        )
        if (!response.ok) {
            const errorResponse = await response.text()
            throw new Error(errorResponse)
        }
    } catch (error) {
        logger.error(error, 'Failed to delete original interaction response')
        logger.error(
            { interaction_id: interaction.id, user: interaction.user },
            'Failed to delete original interaction response'
        )
    }
}

/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createFollowUpMessage(
    interaction: ChatInputCommandInteraction_broker,
    data: object
): Promise<any> {
    try {
        if (
            interaction.token === null ||
            interaction.token === undefined ||
            interaction.applicationId === null ||
            interaction.applicationId === undefined
        ) {
            throw new Error(
                'InteractionToken or InteractionApplicationId is null or undefined'
            )
        }

        const response = await fetch(
            `https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}`,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            }
        )
        if (response.ok) {
            return await response.json()
        } else {
            const errorResponse = await response.text()
            throw new Error(errorResponse)
        }
    } catch (error) {
        logger.error(error, 'Failed to create follow up message')
        logger.error(
            { interaction_id: interaction.id, user: interaction.user },
            'Failed to create follow up message'
        )
    }
}

function constructSerializableInteraction(
    interaction: ChatInputCommandInteraction_broker
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
    }
}

export default {
    createInteractionResponse,
    getOriginalInteractionResponse,
    editOriginalInteractionResponse,
    deleteOriginalInteractionResponse,
    createFollowUpMessage,
    constructSerializableInteraction,
}
