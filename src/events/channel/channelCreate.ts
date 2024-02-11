import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';
import { channelService } from '../../database/services';

export default {
  name: Events.ChannelCreate,
  once: false,
  execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      const dataToStore = channelService.getNeededDateFromChannel(channel);
      addDiscordEvent({ type: Events.ChannelCreate, guildId: channel.guildId, dataToStore })
    }
  },
};
