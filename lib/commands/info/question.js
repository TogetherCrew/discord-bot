"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const responses_1 = require("../../functions/interactions/responses");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(option => option.setName('input1')
        .setDescription('The input to echo back'))
        .addChannelOption(option => option.setName('input2')
        .setDescription('The channel to echo into')),
    async execute(interaction) {
        await (0, responses_1.createInteractionResponse)(interaction, 4, { content: 'Hi', flags: 64 });
        // await createInteractionResponse(interaction, 5, { flags: 64 })
        // const { content } = await getOriginalInteractionResponse(interaction);
        // await editOriginalInteractionResponse(interaction, { content: 'Edit' })
        // await deleteOriginalInteractionResponse(interaction);
        const z = await (0, responses_1.createFollowUpMessage)(interaction, { content: 'f1' });
        console.log(z);
    },
};
