"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const db_1 = require("@togethercrew.dev/db");
const config_1 = __importDefault(require("../../config"));
const connection_1 = require("../../database/connection");
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'ChannelCreate' });
exports.default = {
    name: discord_js_1.Events.ChannelCreate,
    once: false,
    async execute(channel) {
        if (channel instanceof discord_js_1.TextChannel || channel instanceof discord_js_1.VoiceChannel || channel instanceof discord_js_1.CategoryChannel) {
            const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
            logger.info(logFields, 'event is running');
            const connection = db_1.databaseService.connectionFactory(channel.guild.id, config_1.default.mongoose.dbURL);
            try {
                await services_1.channelService.handelChannelChanges(connection, channel);
            }
            catch (err) {
                logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle channel changes');
            }
            finally {
                await (0, connection_1.closeConnection)(connection);
                logger.info(logFields, 'event is done');
            }
        }
    },
};
