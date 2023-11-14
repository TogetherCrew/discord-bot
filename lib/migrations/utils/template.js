"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const database_1 = require("../../database");
const connection_1 = __importDefault(require("../../database/connection"));
require("dotenv/config");
const up = async () => {
    await (0, database_1.connectDB)();
    const connection = connection_1.default.getInstance().getTenantDb("681946187490000803");
    await connection.createCollection('my_collection');
};
exports.up = up;
const down = async () => {
    await (0, database_1.connectDB)();
};
exports.down = down;
