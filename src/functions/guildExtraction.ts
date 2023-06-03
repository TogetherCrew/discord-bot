import { Client, TextChannel, Snowflake } from 'discord.js';
import { guildService } from '../database/services';
import fetchChannelMessages from './fetchMessages';
import { Connection } from 'mongoose';

/**
 * Extracts information from a given guild.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {Client} client - The discord.js client object used to fetch the guild.
 * @param {Snowflake} guildId - The identifier of the guild to extract information from.
 */
export default async function guildExtraction(connection: Connection, client: Client, guildId: Snowflake) {
  try {
    console.log(`Starting the extraction of guildId: ${guildId}`)
    if (!client.guilds.cache.has(guildId)) {
      await guildService.updateGuild({ guildId }, { isDisconnected: false })
      return
    }
    const guild = await client.guilds.fetch(guildId);
    const guildDoc = await guildService.getGuild({ guildId });
    if (guildDoc && guildDoc.selectedChannels && guildDoc.period) {
      await guildService.updateGuild({ guildId }, { isInProgress: true });
      const selectedChannelsIds = guildDoc.selectedChannels.map(selectedChannel => selectedChannel.channelId);
      for (const channelId of selectedChannelsIds) {
        const channel = (await guild.channels.fetch(channelId)) as TextChannel;
        fetchChannelMessages(connection, channel, guildDoc?.period);
      }
    }
    console.log(`Finished the extraction of guildId: ${guildId}`)
  } catch (err) {
    console.log(err);
  }
}


// GUILD : 980858613587382322
// Channel name: Text Channels, ID: 980858613587382323
// Channel name: Voice Channels, ID: 980858613587382324
// Channel name: general, ID: 980858613587382325
// Channel name: General, ID: 980858613587382326
// Channel name: test, ID: 1029501237554581564
// Channel name: special-channel-💪, ID: 1045029797346160741
// Channel name: smalltest, ID: 1045807353729134592
// Channel name: sss, ID: 1050520586692075533
// Channel name: 🏁start-here, ID: 1050530657253736578
// Channel name: ✅introductions, ID: 1050531295765201086
// Channel name: 📘directory, ID: 1050531395191181352
// Channel name: support, ID: 1070322209811349554
// Channel name: new-channel-1, ID: 1105164023009386596
// Channel name: new-category, ID: 1105752192629088267
// Channel name: c1, ID: 1105752303820083221
// Channel name: c2-voice, ID: 1105752336124612719
// Channel name: c3-private, ID: 1105752380026392576
// Channel name: tag, ID: 1108405617846128734
// Channel name: c4, ID: 1109052576978173982
// Channel name: do-not-spam-here, ID: 1109369850276610048
// Channel name: do-not-spam, ID: 1109421233436635198
// Channel name: test1, ID: 1110556724844310568
