import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { createInteractionResponse } from '../../functions/interactions/responses'
import RabbitMQ, { Event, MBConnection, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interfaces';

export default {
	data: new SlashCommandBuilder()
		.setName('ask_hivemind')
		.setDescription('Ask a question and get an answer from Hivemind!')
		.addStringOption(option =>
			option.setName('question')
				.setDescription('Your question to Hivemind')
				.setRequired(true))
	,

	async execute(interaction: ChatInputCommandInteraction) {
		// Acknowledge the user's question
		await createInteractionResponse(interaction, 4, { content: 'Processing your question...', flags: 64 })

		// Extract the user's question
		// const userQuestion = interaction.options.getString('query');

		console.log(interaction)
		console.log('________________________')

		console.log(typeof interaction.options)
		console.log(interaction.options)
		console.log(typeof interaction.user)

		// Send the user's question to RabbitMQ for processing


		const serializedData = JSON.stringify(interaction, stringifyBigIntReplacer);
		RabbitMQ.publish(RabbitMQQueue.HIVEMIND, Event.HIVEMIND.INTERACTION_CREATED, serializedData);

		console.log('________________________')
		console.log(serializedData)
	},
};




function stringifyBigIntReplacer(key: string, value: any) {
	if (typeof value === 'bigint') {
		return value.toString() + 'n'; // Convert BigInt to string with 'n' at the end
	}
	return value;
}

// Use the replacer function with JSON.stringify
