import { Client, Collection } from 'discord.js';
import path from 'path';
import { readdir } from 'node:fs/promises';
import parentLogger from '../../config/logger';
const logger = parentLogger.child({ module: 'LoadCommands' });

export default async function loadCommands(client: Client) {
    client.commands = new Collection();
    const foldersPath: string = path.join(__dirname, '../../commands');
    const commandFolders: string[] = await readdir(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath: string = path.join(foldersPath, folder);
        const commandFiles: string[] = (await readdir(commandsPath)).filter(
            file => file.endsWith('.ts') || file.endsWith('.js')
        );
        for (const file of commandFiles) {
            const filePath: string = path.join(commandsPath, file);
            const command = (await import(filePath)).default;
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                logger.warn({ commandPath: filePath }, 'The command is missing a required "data" or "execute" property.')
            }
        }
    }
}
