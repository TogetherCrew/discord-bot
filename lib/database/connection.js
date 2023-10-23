"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const logger = logger_1.default.child({ module: 'Connection' });
/**
 * Closes a given Mongoose connection.
 * @param {Connection} connection - The Mongoose connection object to be closed.
 * @returns {Promise<void>} - A promise that resolves when the connection has been successfully closed.
 * @throws {MongooseError} - If there is an error closing the connection, it is logged to the console and the error is thrown.
 */
async function closeConnection(connection) {
    try {
        await connection.close();
        logger.info({ database: connection.name }, 'The connection to database has been successfully closed');
    }
    catch (error) {
        logger.fatal({ database: connection.name, error }, 'Failed to close the connection to the database');
    }
}
exports.closeConnection = closeConnection;
