"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const db_1 = require("@togethercrew.dev/db");
const services_1 = require("../../database/services");
const fetchMembers_1 = __importDefault(require("../../functions/fetchMembers"));
const fetchChannels_1 = __importDefault(require("../../functions/fetchChannels"));
const fetchRoles_1 = __importDefault(require("../../functions/fetchRoles"));
const connection_1 = require("../../database/connection");
const logger_1 = __importDefault(require("../../config/logger"));
const config_1 = __importDefault(require("../../config"));
const logger = logger_1.default.child({ event: 'ClientReady' });
exports.default = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info('event is running');
        const guilds = await services_1.guildService.getGuilds({ isDisconnected: false });
        for (let i = 0; i < guilds.length; i++) {
            const connection = db_1.databaseService.connectionFactory(guilds[i].guildId, config_1.default.mongoose.dbURL);
            try {
                logger.info({ guild_id: guilds[i].guildId }, 'Fetching guild members, roles,and channels');
                await (0, fetchMembers_1.default)(connection, client, guilds[i].guildId);
                await (0, fetchRoles_1.default)(connection, client, guilds[i].guildId);
                await (0, fetchChannels_1.default)(connection, client, guilds[i].guildId);
                logger.info({ guild_id: guilds[i].guildId }, 'Fetching guild members, roles, channels is done');
            }
            catch (err) {
                logger.error({ guild_id: guilds[i].guildId, err }, 'Fetching guild members, roles,and channels failed');
            }
            finally {
                await (0, connection_1.closeConnection)(connection);
            }
        }
        logger.info('event is done');
    },
};
