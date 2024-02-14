import { Events, type User } from 'discord.js';
import { addUserEventQueue } from '../../queue/queues/userEvent';

export default {
  name: Events.UserUpdate,
  once: false,
  execute(oldUser: User, newUser: User) {
    const dataToStore = {
      discordId: newUser.id,
      username: newUser.username,
      globalName: newUser.globalName,
    };
    addUserEventQueue({ type: Events.UserUpdate, dataToStore });
  },
};
