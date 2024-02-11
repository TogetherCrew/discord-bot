import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';
import { channelService } from '../../database/services';

export default {
  name: Events.ChannelUpdate,
  once: false,
  execute(oldChannel: Channel, newChannel: Channel) {
    if (newChannel instanceof TextChannel || newChannel instanceof VoiceChannel || newChannel instanceof CategoryChannel) {
      const dataToStore = channelService.getNeededDateFromChannel(newChannel);
      addDiscordEvent({ type: Events.ChannelUpdate, guildId: newChannel.guildId, dataToStore })
    }
  },
};
