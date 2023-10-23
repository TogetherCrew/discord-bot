"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'rawInfoService' });
/**
 * Create a rawInfo entry in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo} rawInfo - The rawInfo object to be created.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the created rawInfo object.
 */
async function createRawInfo(connection, rawInfo) {
    try {
        return await connection.models.RawInfo.create(rawInfo);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.code == 11000) {
            logger.warn({ database: connection.name, channel_id: rawInfo.channelId, message_id: rawInfo.messageId }, 'Failed to create duplicate rawInfo');
            return null;
        }
        logger.error({ database: connection.name, channel_id: rawInfo.channelId, message_id: rawInfo.messageId }, 'Failed to create rawInfo');
        return null;
    }
}
/**
 * Create multiple rawInfo entries in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} rawInfos - An array of rawInfo objects to be created.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the created rawInfo objects.
 */
async function createRawInfos(connection, rawInfos) {
    try {
        return await connection.models.RawInfo.insertMany(rawInfos, { ordered: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.code == 11000) {
            logger.warn({ database: connection.name }, 'Failed to create duplicate rawInfos');
            return [];
        }
        logger.error({ database: connection.name, error }, 'Failed to create rawInfos');
        return [];
    }
}
/**
 * Get a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the matching rawInfo object or null if not found.
 */
async function getRawInfo(connection, filter) {
    return await connection.models.RawInfo.findOne(filter);
}
/**
 * Get rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entries.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the matching rawInfo objects.
 */
async function getRawInfos(connection, filter) {
    return await connection.models.RawInfo.find(filter);
}
/**
 * Update a rawInfo entry in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @param {IRawInfo} updateBody - An object containing the updated rawInfo data.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the updated rawInfo object or null if not found.
 */
async function updateRawInfo(connection, filter, updateBody) {
    try {
        const rawInfo = await connection.models.RawInfo.findOne(filter);
        if (!rawInfo) {
            return null;
        }
        Object.assign(rawInfo, updateBody);
        return await rawInfo.save();
    }
    catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update rawInfo');
        return null;
    }
}
/**
 * Update multiple rawInfo entries in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple rawInfo entries.
 * @param {IRawInfo} updateBody - An object containing the updated rawInfo data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated rawInfo entries.
 */
async function updateManyRawInfo(connection, filter, updateBody) {
    try {
        const updateResult = await connection.models.RawInfo.updateMany(filter, updateBody);
        return updateResult.modifiedCount || 0;
    }
    catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update rawInfos');
        return 0;
    }
}
/**
 * Delete a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the rawInfo entry was successfully deleted, or false otherwise.
 */
async function deleteRawInfo(connection, filter) {
    try {
        const deleteResult = await connection.models.RawInfo.deleteOne(filter);
        return deleteResult.deletedCount === 1;
    }
    catch (error) {
        logger.error({ database: connection.name, filter, error }, 'Failed to delete rawInfo');
        return false;
    }
}
/**
 * Delete multiple rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple rawInfo entries for deletion.
 * @returns {Promise<number>} - A promise that resolves to the number of deleted rawInfo entries.
 * @throws {Error} - If there is an error while deleting the rawInfo entries.
 */
async function deleteManyRawInfo(connection, filter) {
    try {
        const deleteResult = await connection.models.RawInfo.deleteMany(filter);
        return deleteResult.deletedCount;
    }
    catch (error) {
        logger.error({ database: connection.name, filter, error }, 'Failed to delete rawInfos');
        return 0;
    }
}
/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getNewestRawInfo(connection, filter) {
    return await connection.models.RawInfo.findOne(filter).sort({ createdDate: -1 });
}
/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getOldestRawInfo(connection, filter) {
    return await connection.models.RawInfo.findOne(filter).sort({ createdDate: 1 });
}
exports.default = {
    createRawInfo,
    createRawInfos,
    updateRawInfo,
    updateManyRawInfo,
    deleteRawInfo,
    deleteManyRawInfo,
    getRawInfo,
    getRawInfos,
    getNewestRawInfo,
    getOldestRawInfo,
};
