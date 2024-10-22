import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import parentLogger from '../config/logger';
import config from '../config';
const logger = parentLogger.child({ module: `deleteRnDAOGuildCommands` });

/**
 * Delete RnDAO guild commands
 */
async function deleteRnDAOGuildCommands(): Promise<void> {
  try {
    const rest = new REST().setToken(config.discord.botToken);
    const guildCommands: any = await rest.get(
      // RnDAO:915914985140531240
      Routes.applicationGuildCommands(config.discord.clientId, '915914985140531240'),
    );
    guildCommands.forEach(async (command: any) => {
      await rest.delete(Routes.applicationGuildCommand(config.discord.clientId, '915914985140531240', command.id));
    });
  } catch (error) {
    logger.error('Failed to delete RnDAO guild commands', error);
  }
}

deleteRnDAOGuildCommands().catch((error) => {
  logger.error('Unhandled exception in deleting RnDAO guild commands', error);
});
