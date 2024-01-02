"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowUpMessage = exports.deleteOriginalInteractionResponse = exports.editOriginalInteractionResponse = exports.getOriginalInteractionResponse = exports.createInteractionResponse = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'InteractionResponses' });
/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createInteractionResponse(interaction, data) {
    try {
        // {4, 5, 9, 10, 11}
        const { type } = data, rest = __rest(data, ["type"]);
        const body = {
            type: type,
            data: rest.data
        };
        const response = await (0, node_fetch_1.default)(`https://discord.com/api/interactions/${interaction.id}/${interaction.token}/callback`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error();
        }
    }
    catch (error) {
        logger.error({ interaction_id: interaction.id, interaction_token: interaction.token, error }, 'Failed to send interaction response');
    }
}
exports.createInteractionResponse = createInteractionResponse;
/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function getOriginalInteractionResponse(interaction) {
    try {
        const response = await (0, node_fetch_1.default)(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error(await response.json());
        }
    }
    catch (error) {
        logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
    }
}
exports.getOriginalInteractionResponse = getOriginalInteractionResponse;
/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function editOriginalInteractionResponse(interaction, data) {
    try {
        const response = await (0, node_fetch_1.default)(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error(await response.json());
        }
    }
    catch (error) {
        logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
    }
}
exports.editOriginalInteractionResponse = editOriginalInteractionResponse;
/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function deleteOriginalInteractionResponse(interaction) {
    try {
        const response = await (0, node_fetch_1.default)(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}/messages/@original`, {
            method: 'DELETE',
            // headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(await response.json());
        }
    }
    catch (error) {
        logger.error({ application_id: interaction.applicationId, interaction_token: interaction.token, error }, '100');
    }
}
exports.deleteOriginalInteractionResponse = deleteOriginalInteractionResponse;
/**
 * exchange discord code with access token
 * @param {string} code
   @param {string} redirect_uri
 * @returns {Promise<IDiscordOathBotCallback>}
 */
async function createFollowUpMessage(interaction, data) {
    try {
        const response = await (0, node_fetch_1.default)(`https://discord.com/api/webhooks/${interaction.applicationId}/${interaction.token}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            return await response.json();
        }
        else {
            throw new Error(await response.json());
        }
    }
    catch (error) {
        logger.error({ interaction_id: interaction.id, interaction_token: interaction.token, error }, 'Failed to send interaction response');
    }
}
exports.createFollowUpMessage = createFollowUpMessage;
