/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from 'discord.js';
import { createInteractionResponse } from '../../functions/interactions/responses'
import RabbitMQ, { Event, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interfaces';

export default {
	data: new SlashCommandBuilder()
		.setName('question')
		.setDescription('Ask a question and get an answer from Hivemind!')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('Your question to Hivemind')
				.setRequired(true)),

	async execute(interaction: ChatInputCommandInteraction_broker) {
		if (!interaction.member?.roles.cache.has("1166350549889859657")) {
			return await createInteractionResponse(interaction, { type: 4, data: { content: 'You do not have the required role to use this command!', flags: 64 } })
		}
		const serializedInteraction = constructSerializableInteraction(interaction);
		const serializedData = JSON.stringify(serializedInteraction, stringifyBigIntReplacer);
		RabbitMQ.publish(RabbitMQQueue.HIVEMIND, Event.HIVEMIND.INTERACTION_CREATED, { interaction: serializedData });
	},
};

function constructSerializableInteraction(interaction: ChatInputCommandInteraction_broker): ChatInputCommandInteraction_broker {
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

function stringifyBigIntReplacer(key: string, value: any) {
	if (typeof value === 'bigint') {
		return value.toString() + 'n';
	}
	return value;
}

