"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const logger_1 = __importDefault(require("../../config/logger"));
const connection_1 = __importDefault(require("../../database/connection"));
const logger = logger_1.default.child({ event: 'GuildMemberUpdate' });
exports.default = {
    name: discord_js_1.Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember, newMember) {
        const logFields = { guild_id: newMember.guild.id, guild_member_id: newMember.user.id };
        logger.info(logFields, 'event is running');
        const connection = connection_1.default.getInstance().getTenantDb(newMember.guild.id);
        logger.info(logFields, 'event is done');
        try {
            await services_1.guildMemberService.handelGuildMemberChanges(connection, newMember);
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle guild member changes');
        }
    },
};
