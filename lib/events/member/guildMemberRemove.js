"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'GuildMemberRemove' });
exports.default = {
    name: discord_js_1.Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        const logFields = { guild_id: member.guild.id, guild_member_id: member.user.id };
        logger.info(logFields, 'event is running');
        const connection = connection_1.default.getInstance().getTenantDb(member.guild.id);
        try {
            const guildMemberDoc = await services_1.guildMemberService.getGuildMember(connection, { discordId: member.user.id });
            await (guildMemberDoc === null || guildMemberDoc === void 0 ? void 0 : guildMemberDoc.softDelete());
            logger.info(logFields, 'event is done');
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to soft delete the guild member');
        }
    },
};
