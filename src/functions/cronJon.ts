import { Client, Snowflake } from 'discord.js';
import { guildService } from '../database/services';
import { databaseService } from 'tc_dbcomm';
import { ChoreographyDict, MBConnection, Status } from "@togethercrew.dev/tc-messagebroker"
import config from '../config';
import guildExtraction from './guildExtraction'

async function createAndStartCronJobSaga(guildId: Snowflake) {
    const saga = await MBConnection.models.Saga.create({
        status: Status.NOT_STARTED,
        data: { guildId },
        choreography: ChoreographyDict.DISCORD_SCHEDULED_JOB
    })

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await saga.start(() => { })
}

/**
 * Runs the extraction process for multiple guilds.
 * @param {Client} client - The discord.js client object used to fetch the guilds.
 */
export default async function cronJob(client: Client) {
    try {
        const guilds = await guildService.getGuilds({ isDisconnected: false });
        for (let i = 0; i < guilds.length; i++) {
            const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
            await guildExtraction(connection, client, guilds[i].guildId)
            await createAndStartCronJobSaga(guilds[i].guildId)
        }
    } catch (err) {
        console.log(err);
    }
}




