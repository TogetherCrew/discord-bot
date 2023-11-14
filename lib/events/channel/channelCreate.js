"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'ChannelCreate' });
exports.default = {
    name: discord_js_1.Events.ChannelCreate,
    once: false,
    async execute(channel) {
        if (channel instanceof discord_js_1.TextChannel || channel instanceof discord_js_1.VoiceChannel || channel instanceof discord_js_1.CategoryChannel) {
            const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
            logger.info(logFields, 'event is running');
            const connection = connection_1.default.getInstance().getTenantDb(channel.guild.id);
            try {
                await services_1.channelService.handelChannelChanges(connection, channel);
                logger.info(logFields, 'event is done');
            }
            catch (err) {
                logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle channel changes');
            }
        }
    },
};
