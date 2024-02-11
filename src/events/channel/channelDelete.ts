import { Events, type Channel, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { addDiscordEvent } from '../../queue/queues/discordEvent';

export default {
  name: Events.ChannelDelete,
  once: false,
  execute(channel: Channel) {
    if (channel instanceof TextChannel || channel instanceof VoiceChannel || channel instanceof CategoryChannel) {
      addDiscordEvent({ type: Events.ChannelDelete, guildId: channel.guildId, channelId: channel.id })
    }
  },
};
