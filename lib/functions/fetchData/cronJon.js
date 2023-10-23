"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../database/services");
const db_1 = require("@togethercrew.dev/db");
const tc_messagebroker_1 = require("@togethercrew.dev/tc-messagebroker");
const config_1 = __importDefault(require("../../config"));
const guildExtraction_1 = __importDefault(require("./guildExtraction"));
const connection_1 = require("../../database/connection");
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'CronJob' });
async function createAndStartCronJobSaga(guildId) {
    try {
        const saga = await tc_messagebroker_1.MBConnection.models.Saga.create({
            status: tc_messagebroker_1.Status.NOT_STARTED,
            data: { guildId },
            choreography: tc_messagebroker_1.ChoreographyDict.DISCORD_SCHEDULED_JOB,
        });
        await saga.start();
    }
    catch (err) {
        logger.error({ guild_Id: guildId, err }, 'Faield to create saga');
    }
}
/**
 * Runs the extraction process for multiple guilds.
 * @param {Client} client - The discord.js client object used to fetch the guilds.
 */
async function cronJob(client) {
    logger.info('event is running');
    const guilds = await services_1.guildService.getGuilds({ isDisconnected: false });
    for (let i = 0; i < guilds.length; i++) {
        const connection = db_1.databaseService.connectionFactory(guilds[i].guildId, config_1.default.mongoose.dbURL);
        try {
            logger.info({ guild_id: guilds[i].guildId }, 'is running cronJob for guild');
            await (0, guildExtraction_1.default)(connection, client, guilds[i].guildId);
            await createAndStartCronJobSaga(guilds[i].guildId);
            logger.info({ guild_id: guilds[i].guildId }, 'cronJob is done for guild');
        }
        catch (err) {
            logger.error({ guild_id: guilds[i].guildId, err }, 'CronJob faield for guild');
        }
        finally {
            await (0, connection_1.closeConnection)(connection);
        }
    }
    logger.info('event is done');
}
exports.default = cronJob;
