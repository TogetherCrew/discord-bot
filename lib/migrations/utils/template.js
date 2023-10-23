"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const database_1 = require("../../database");
const db_1 = require("@togethercrew.dev/db");
require("dotenv/config");
const config_1 = __importDefault(require("../../config"));
const up = async () => {
    await (0, database_1.connectDB)();
    const connection = db_1.databaseService.connectionFactory('681946187490000803', config_1.default.mongoose.dbURL);
    await connection.createCollection('my_collection');
};
exports.up = up;
const down = async () => {
    await (0, database_1.connectDB)();
};
exports.down = down;
