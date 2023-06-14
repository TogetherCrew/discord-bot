import { Connection } from 'mongoose';
import { IRawInfo, IRawInfoUpdateBody } from '@togethercrew.dev/db';

/**
 * Create a rawInfo entry in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo} rawInfo - The rawInfo object to be created.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the created rawInfo object.
 */
async function createRawInfo(connection: Connection, rawInfo: IRawInfo): Promise<IRawInfo | null> {
  try {
    return await connection.models.RawInfo.create(rawInfo);
  } catch (error) {
    console.log('Failed to create rawInfo', error);
    return null;
  }
}

/**
 * Create multiple rawInfo entries in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} rawInfos - An array of rawInfo objects to be created.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the created rawInfo objects.
 */
async function createRawInfos(connection: Connection, rawInfos: IRawInfo[]): Promise<IRawInfo[] | []> {
  try {
    return await connection.models.RawInfo.insertMany(rawInfos, { ordered: false });
  } catch (error) {
    console.log('Failed to create rawInfos', error);
    return [];
  }
}

/**
 * Get a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the matching rawInfo object or null if not found.
 */
async function getRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
  try {
    return await connection.models.RawInfo.findOne(filter);
  } catch (error) {
    console.log('Failed to retrieve rawInfo', error);
    return null;
  }
}

/**
 * Get rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entries.
 * @returns {Promise<IRawInfo[] | []>} - A promise that resolves to an array of the matching rawInfo objects.
 */
async function getRawInfos(connection: Connection, filter: object): Promise<IRawInfo[] | []> {
  try {
    return await connection.models.RawInfo.find(filter);
  } catch (error) {
    console.log('Failed to retrieves rawInfo', error);
    return [];
  }
}

/**
 * Update a rawInfo entry in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @param {IRawInfo} UpdateBody - An object containing the updated rawInfo data.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the updated rawInfo object or null if not found.
 */
async function updateRawInfo(
  connection: Connection,
  filter: object,
  UpdateBody: IRawInfoUpdateBody
): Promise<IRawInfo | null> {
  try {
    const rawInfo = await connection.models.RawInfo.findOne(filter);
    if (!rawInfo) {
      return null;
    }
    Object.assign(rawInfo, UpdateBody);
    return await rawInfo.save();
  } catch (error) {
    console.log('Failed to update rawInfo', error);
    return null;
  }
}

/**
 * Update multiple rawInfo entries in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple rawInfo entries.
 * @param {IRawInfo} UpdateBody - An object containing the updated rawInfo data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated rawInfo entries.
 */
async function updateManyRawInfo(
  connection: Connection,
  filter: object,
  UpdateBody: IRawInfoUpdateBody
): Promise<number> {
  try {
    const updateResult = await connection.models.RawInfo.updateMany(filter, UpdateBody);
    return updateResult.modifiedCount || 0;
  } catch (error) {
    console.log('Failed to update rawInfos', error);
    return 0;
  }
}

/**
 * Delete a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the rawInfo entry was successfully deleted, or false otherwise.
 */
async function deleteRawInfo(connection: Connection, filter: object): Promise<boolean> {
  try {
    const deleteResult = await connection.models.RawInfo.deleteOne(filter);
    return deleteResult.deletedCount === 1;
  } catch (error) {
    console.log('Failed to delete rawInfo', error);
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
async function deleteManyRawInfo(connection: Connection, filter: object): Promise<number> {
  try {
    const deleteResult = await connection.models.RawInfo.deleteMany(filter);
    return deleteResult.deletedCount;
  } catch (error) {
    console.log('Failed to delete rawInfo', error);
    return 0;
  }
}

/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getNewestRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
  try {
    return await connection.models.RawInfo.findOne(filter).sort({ createdDate: -1 });
  } catch (error) {
    console.log('Failed to retrieve NewestRawInfo', error);
    return null;
  }
}

/**
 * Retrieves the oldest rawInfo object from the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry.
 * @returns {Promise<IRawInfo | null>} - A promise that resolves to the oldest rawInfo object for the channel, or null if not found.
 */
async function getOldestRawInfo(connection: Connection, filter: object): Promise<IRawInfo | null> {
  try {
    return await connection.models.RawInfo.findOne(filter).sort({ createdDate: 1 });
  } catch (error) {
    console.log('Failed to retrieve OldestRawInfo', error);
    return null;
  }
}

export default {
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
