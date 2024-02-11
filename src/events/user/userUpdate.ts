import { Events, type User } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.UserUpdate,
  once: false,
  execute(oldUser: User, newUser: User) {
    const dataToStore = {
      discordId: newUser.id,
      username: newUser.username,
      globalName: newUser.globalName,
    };
    addDiscordEvent({ type: Events.UserUpdate, dataToStore });
  },
};
