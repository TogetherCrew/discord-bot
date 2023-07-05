import { Client, Snowflake, TextChannel, VoiceChannel, CategoryChannel } from 'discord.js';
import { Connection } from 'mongoose';
import { IChannel } from '@togethercrew.dev/db';
import { channelService, guildService } from '../database/services';

/**
* Extracts necessary data from a given channel.
* @param {Array<TextChannel | VoiceChannel | CategoryChannel>} channelArray - An array of channels from which data is to be extracted.
* @returns {IChannel} - The extracted data in the form of an IChannel object.
*/
function getNeedDataFromChannel(channel: TextChannel | VoiceChannel | CategoryChannel): IChannel {
    return {
        channelId: channel.id,
        name: channel.name, // cast to TextChannel for 'name'
        parentId: channel.parentId,
        // ... extract other properties as needed
    };
}

/**
* Iterates over a list of channels and pushes extracted data from each channel to an array.
* @param {IChannel[]} arr - The array to which extracted data will be pushed.
* @param {Array<TextChannel | VoiceChannel | CategoryChannel>} channelArray - An array of channels from which data is to be extracted.
* @returns {IChannel[]} - The updated array containing the extracted data.
*/
function pushChannelsToArray(arr: IChannel[], channelArray: Array<TextChannel | VoiceChannel | CategoryChannel>): IChannel[] {
    for (const channel of channelArray) {
        arr.push(getNeedDataFromChannel(channel));
    }
    return arr;
}

/**
* Fetches and saves text and voice channel information from a given guild.
* @param {Connection} connection - Mongoose connection object for the database.
* @param {Client} client - The discord.js client object used to fetch the guild.
* @param {Snowflake} guildId - The identifier of the guild to extract text and voice channels from.
*/
export default async function fetchGuildChannels(connection: Connection, client: Client, guildId: Snowflake) {
    console.log(`Fetching text and voice channels for guild: ${guildId}`)
    try {
        if (!client.guilds.cache.has(guildId)) {
            await guildService.updateGuild({ guildId }, { isDisconnected: false })
            return
        }
        const guild = await client.guilds.fetch(guildId);
        const channelsToStore: IChannel[] = [];
        const textAndVoiceChannels = [...guild.channels.cache.values()].filter(channel => channel.type === 0 || channel.type === 2 || channel.type === 4) as Array<TextChannel | VoiceChannel>;
        pushChannelsToArray(channelsToStore, textAndVoiceChannels);
        await channelService.createChannels(connection, channelsToStore); // assuming a 'channelService'
    } catch (err) {
        console.error(`Failed to fetch text and voice channels of guild ${guildId}`, err);
    }
    console.log(`Completed fetching text and voice channels for guild: ${guildId}`)
}