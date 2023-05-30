import { Client } from 'discord.js';
import { guildService } from '../database/services';
import { databaseService } from 'tc_dbcomm';
import config from '../config';
import guildExtraction from './guildExtraction'

/**
 * Runs the extraction process for multiple guilds.
 * @param {Client} client - The discord.js client object used to fetch the guilds.
 */
export default async function cronJob(client: Client) {
    console.log('HELLO BITCH')
    // try {
    //     const guilds = await guildService.getGuilds({ isDisconnected: false });
    //     for (let i = 0; i < guilds.length; i++) {
    //         const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
    //         await guildExtraction(connection, client, guilds[i].guildId)
    //     }
    // } catch (err) {
    //     console.log(err);
    // }
}