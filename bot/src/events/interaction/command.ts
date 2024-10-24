import { Events, type BaseInteraction } from 'discord.js'

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand()) return
        const command = interaction.client.commands.get(interaction.commandName)
        await command.execute(interaction)
    },
}
