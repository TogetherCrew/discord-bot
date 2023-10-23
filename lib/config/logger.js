"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const index_1 = __importDefault(require("./index"));
exports.default = (0, pino_1.default)({
    level: index_1.default.logger.level,
    formatters: {
        level: label => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
    bindings: (bindings) => {
        return {
            pid: bindings.pid,
            host: bindings.hostname,
        };
    },
});
