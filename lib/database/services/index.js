"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelService = exports.roleService = exports.rawInfoService = exports.guildService = exports.guildMemberService = void 0;
const guildMember_service_1 = __importDefault(require("./guildMember.service"));
exports.guildMemberService = guildMember_service_1.default;
const rawInfo_service_1 = __importDefault(require("./rawInfo.service"));
exports.rawInfoService = rawInfo_service_1.default;
const guild_service_1 = __importDefault(require("./guild.service"));
exports.guildService = guild_service_1.default;
const role_service_1 = __importDefault(require("./role.service"));
exports.roleService = role_service_1.default;
const channel_service_1 = __importDefault(require("./channel.service"));
exports.channelService = channel_service_1.default;
