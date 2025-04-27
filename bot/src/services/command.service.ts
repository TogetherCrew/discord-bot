import { Collection, REST, Routes } from 'discord.js'
import { readdir } from 'node:fs/promises'
import path from 'path'

import config from '../config'
import parentLogger from '../config/logger'
import { coreService } from '../services'

const logger = parentLogger.child({ module: 'CommandService' })

async function loadCommands(): Promise<void> {
    const bot = coreService.DiscordBotManager.getInstance()
    const client = await bot.getClient()
    client.commands = new Collection()
    const foldersPath: string = path.join(__dirname, '../commands')
    const commandFolders: string[] = await readdir(foldersPath)
    for (const folder of commandFolders) {
        const commandsPath: string = path.join(foldersPath, folder)
        const commandFiles: string[] = (await readdir(commandsPath)).filter(
            (file) => file.endsWith('.ts') || file.endsWith('.js')
        )
        for (const file of commandFiles) {
            const filePath: string = path.join(commandsPath, file)
            const command = (await import(filePath)).default
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command)
            } else {
                logger.warn(
                    { commandPath: filePath },
                    'The command is missing a required "data" or "execute" property.'
                )
            }
        }
    }
}

async function registerCommand(): Promise<void> {
    try {
        const bot = coreService.DiscordBotManager.getInstance()
        const client = await bot.getClient()
        const rest = new REST().setToken(config.discord.botToken)
        const commandData = [...client.commands.values()].map((command) => command.data.toJSON())
        await rest.put(Routes.applicationCommands(config.discord.clientId), {
            body: commandData,
        })
        logger.info('Discord commands Registerd')
    } catch (err) {
        logger.error({ err }, 'Failed to register the slash command')
    }
}

export default {
    loadCommands,
    registerCommand,
}
