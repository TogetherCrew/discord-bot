"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const discord_js_1 = require("discord.js");
const responses_1 = require("../../functions/interactions/responses");
const tc_messagebroker_1 = __importStar(require("@togethercrew.dev/tc-messagebroker"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('question')
        .setDescription('Ask a question and get an answer from Hivemind!')
        .addStringOption(option => option.setName('question')
        .setDescription('Your question to Hivemind')
        .setRequired(true)),
    async execute(interaction) {
        var _a;
        if (!((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.roles.cache.has("1166350549889859657"))) {
            return await (0, responses_1.createInteractionResponse)(interaction, { type: 4, data: { content: 'You do not have the required role to use this command!', flags: 64 } });
        }
        const serializedInteraction = constructSerializableInteraction(interaction);
        const serializedData = JSON.stringify(serializedInteraction, stringifyBigIntReplacer);
        tc_messagebroker_1.default.publish(tc_messagebroker_1.Queue.HIVEMIND, tc_messagebroker_1.Event.HIVEMIND.INTERACTION_CREATED, { interaction: serializedData });
    },
};
function constructSerializableInteraction(interaction) {
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
        appPermissions: interaction.appPermissions,
        memberPermissions: interaction.memberPermissions,
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
function stringifyBigIntReplacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString() + 'n';
    }
    return value;
}
