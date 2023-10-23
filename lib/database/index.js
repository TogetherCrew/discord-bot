"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../config/logger"));
async function connectDB() {
    mongoose_1.default.set('strictQuery', false);
    mongoose_1.default
        .connect(config_1.default.mongoose.serverURL)
        .then(() => {
        logger_1.default.info({ url: config_1.default.mongoose.serverURL }, 'Connected to MongoDB!');
    })
        .catch(error => logger_1.default.error({ url: config_1.default.mongoose.serverURL, error }, 'Failed to connect to MongoDB!'));
}
exports.connectDB = connectDB;
