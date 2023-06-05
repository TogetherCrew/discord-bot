import { Client, Snowflake } from 'discord.js';
import { guildService } from '../database/services';
import { databaseService } from '@togethercrew.dev/db';
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
            console.log(`Cron JOB is running for ${guilds[i].guildId}:${guilds[i].name}`)
            const connection = databaseService.connectionFactory(guilds[i].guildId, config.mongoose.dbURL);
            await guildExtraction(connection, client, guilds[i].guildId)
            await createAndStartCronJobSaga(guilds[i].guildId)
            console.log(`Cron JOB is Done ${guilds[i].guildId}:${guilds[i].name}`)
        }
    } catch (err) {
        console.log('Cron job failed', err)
    }
}




