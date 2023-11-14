"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'ChannelUpdate' });
exports.default = {
    name: discord_js_1.Events.ChannelUpdate,
    once: false,
    async execute(oldChannel, newChannel) {
        if (newChannel instanceof discord_js_1.TextChannel ||
            newChannel instanceof discord_js_1.VoiceChannel ||
            newChannel instanceof discord_js_1.CategoryChannel) {
            const logFields = { guild_id: newChannel.guild.id, channel_id: newChannel.id };
            logger.info(logFields, 'event is running');
            const connection = connection_1.default.getInstance().getTenantDb(newChannel.guild.id);
            try {
                await services_1.channelService.handelChannelChanges(connection, newChannel);
            }
            catch (err) {
                logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle channel changes');
                logger.info(logFields, 'event is done');
            }
        }
    },
};
