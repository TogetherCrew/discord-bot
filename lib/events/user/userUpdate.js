"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'UserUpdate' });
exports.default = {
    name: discord_js_1.Events.UserUpdate,
    once: false,
    async execute(oldUser, newUser) {
        const logFields = { user_id: newUser.id };
        logger.info(logFields, 'event is running');
        try {
            const guilds = await services_1.guildService.getGuilds({});
            for (let i = 0; i < guilds.length; i++) {
                const connection = connection_1.default.getInstance().getTenantDb(guilds[i].guildId);
                await services_1.guildMemberService.updateGuildMember(connection, { discordId: newUser.id }, {
                    username: newUser.username,
                    globalName: newUser.globalName,
                });
            }
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle user changes');
        }
        logger.info(logFields, 'event is done');
    },
};
