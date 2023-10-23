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
const logger = logger_1.default.child({ event: 'GuildRoleCreate' });
exports.default = {
    name: discord_js_1.Events.GuildRoleCreate,
    once: false,
    async execute(role) {
        const logFields = { guild_id: role.guild.id, role_id: role.id };
        logger.info(logFields, 'event is running');
        const connection = db_1.databaseService.connectionFactory(role.guild.id, config_1.default.mongoose.dbURL);
        try {
            await services_1.roleService.handelRoleChanges(connection, role);
        }
        catch (err) {
            logger.error(Object.assign(Object.assign({}, logFields), { err }), 'Failed to handle role changes');
        }
        finally {
            await (0, connection_1.closeConnection)(connection);
            logger.info(logFields, 'event is done');
        }
    },
};
