import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { addGuildEventQueue } from '../../queue/queues/guildEvent';
import { channelService } from '../../database/services';

export default {
  name: Events.ChannelCreate,
  once: false,
  execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      const dataToStore = channelService.getNeededDateFromChannel(channel);
      addGuildEventQueue({ type: Events.ChannelCreate, guildId: channel.guildId, dataToStore });
    }
  },
};
