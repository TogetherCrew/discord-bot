import { Collection, REST, Routes } from 'discord.js';
import path from 'path';
import { readdir } from 'node:fs/promises';
import config from '../config';
import { coreService } from '../services';
import parentLogger from '../config/logger';
const logger = parentLogger.child({ module: 'CommandService' });

async function loadCommands(): Promise<void> {
  const client = await coreService.DiscordBotManager.getClient();
  client.commands = new Collection();
  const foldersPath: string = path.join(__dirname, '../commands');
  const commandFolders: string[] = await readdir(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath: string = path.join(foldersPath, folder);
    const commandFiles: string[] = (await readdir(commandsPath)).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );
    for (const file of commandFiles) {
      const filePath: string = path.join(commandsPath, file);
      const command = (await import(filePath)).default;
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        logger.warn({ commandPath: filePath }, 'The command is missing a required "data" or "execute" property.');
      }
    }
  }
}

async function registerCommand(): Promise<void> {
  try {
    const client = await coreService.DiscordBotManager.getClient();
    const rest = new REST().setToken(config.discord.botToken);
    const commandData = [...client.commands.values()].map((command) => command.data.toJSON());
    await rest.put(
      // RnDAO: 915914985140531240
      Routes.applicationGuildCommands(config.discord.clientId, '980858613587382322'),
      { body: commandData },
    );
    logger.info('Commands Registerd');
  } catch (err) {
    logger.error({ err }, 'Failed to register the slash command');
  }
}

export default {
  loadCommands,
  registerCommand,
};
