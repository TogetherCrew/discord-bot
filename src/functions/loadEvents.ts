import { Client } from 'discord.js';
import path from 'path';
import { readdir } from 'node:fs/promises';

export default async function loadEvents(client: Client) {
  const foldersPath: string = path.join(__dirname, '../events');
  const eventFolders: string[] = await readdir(foldersPath);
  for (const folder of eventFolders) {
    const eventsPath: string = path.join(foldersPath, folder);
    const eventFiles: string[] = (await readdir(eventsPath)).filter(
      file => file.endsWith('.ts') || file.endsWith('.js')
    );
    for (const file of eventFiles) {
      const filePath: string = path.join(eventsPath, file);
      const event = (await import(filePath)).default;
      if (event.once) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.once(event.name, (...args: any[]) => event.execute(...args));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.on(event.name, (...args: any[]) => event.execute(...args));
      }
    }
  }
}
