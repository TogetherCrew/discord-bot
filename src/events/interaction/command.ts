import { Events, BaseInteraction } from 'discord.js';
import parentLogger from '../../config/logger';

const logger = parentLogger.child({ event: 'Command' });

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction: BaseInteraction) {
		if (!interaction.isChatInputCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		await command.execute(interaction);
	},
};
