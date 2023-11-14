"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const connection_1 = __importDefault(require("../../database/connection"));
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ event: 'GuildRoleDelete' });
exports.default = {
    name: discord_js_1.Events.GuildRoleDelete,
    once: false,
    async execute(role) {
        const logFields = { guild_id: role.guild.id, role_id: role.id };
        logger.info(logFields, 'event is running');
        const connection = connection_1.default.getInstance().getTenantDb(role.guild.id);
        try {
            const roleDoc = await services_1.roleService.getRole(connection, { roleId: role.id });
            await (roleDoc === null || roleDoc === void 0 ? void 0 : roleDoc.softDelete());
            logger.info(logFields, 'event is done');
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to soft delete the role');
        }
    },
};
