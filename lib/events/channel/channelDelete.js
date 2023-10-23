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
const logger = logger_1.default.child({ event: 'ChannelDelete' });
exports.default = {
    name: discord_js_1.Events.ChannelDelete,
    once: false,
    async execute(channel) {
        var _a;
        if (channel instanceof discord_js_1.TextChannel || channel instanceof discord_js_1.VoiceChannel || channel instanceof discord_js_1.CategoryChannel) {
            const logFields = { guild_id: channel.guild.id, channel_id: channel.id };
            logger.info(logFields, 'event is running');
            const connection = db_1.databaseService.connectionFactory(channel.guild.id, config_1.default.mongoose.dbURL);
            try {
                const channelDoc = await services_1.channelService.getChannel(connection, { channelId: channel.id });
                await (channelDoc === null || channelDoc === void 0 ? void 0 : channelDoc.softDelete());
                const guildDoc = await services_1.guildService.getGuild({ guildId: channel.guild.id });
                const updatedSelecetdChannels = (_a = guildDoc === null || guildDoc === void 0 ? void 0 : guildDoc.selectedChannels) === null || _a === void 0 ? void 0 : _a.filter(selectedChannel => selectedChannel.channelId !== channel.id);
                await services_1.guildService.updateGuild({ guildId: channel.guild.id }, { selectedChannels: updatedSelecetdChannels });
            }
            catch (err) {
                logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to soft delete the channel');
            }
            finally {
                await (0, connection_1.closeConnection)(connection);
                logger.info(logFields, 'event is done');
            }
        }
    },
};
