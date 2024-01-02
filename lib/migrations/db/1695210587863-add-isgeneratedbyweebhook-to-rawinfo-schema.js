"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const services_1 = require("../../database/services");
const database_1 = require("../../database");
const config_1 = __importDefault(require("../../config"));
const connection_1 = __importDefault(require("../../database/connection"));
const webhookLogic_1 = __importDefault(require("../utils/webhookLogic"));
const { Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages } = discord_js_1.GatewayIntentBits;
const up = async () => {
    const client = new discord_js_1.Client({
        intents: [Guilds, GuildMembers, GuildMessages, GuildPresences, DirectMessages],
    });
    await client.login(config_1.default.discord.botToken);
    await (0, database_1.connectDB)();
    const guilds = await services_1.guildService.getGuilds({});
    for (let i = 0; i < guilds.length; i++) {
        const connection = connection_1.default.getInstance().getTenantDb(guilds[i].guildId);
        await (0, webhookLogic_1.default)(connection, client, guilds[i].guildId);
    }
};
exports.up = up;
const down = async () => {
    // TODO: Implement rollback logic if needed
};
exports.down = down;
