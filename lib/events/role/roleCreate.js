"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'GuildRoleCreate' });
exports.default = {
    name: discord_js_1.Events.GuildRoleCreate,
    once: false,
    async execute(role) {
        const logFields = { guild_id: role.guild.id, role_id: role.id };
        logger.info(logFields, 'event is running');
        const connection = connection_1.default.getInstance().getTenantDb(role.guild.id);
        try {
            await services_1.roleService.handelRoleChanges(connection, role);
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle role changes');
            logger.info(logFields, 'event is done');
        }
    },
};
