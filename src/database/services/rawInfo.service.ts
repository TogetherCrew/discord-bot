import { Connection } from 'mongoose';
import { IRawInfo, IRawInfoUpdateBody } from '@togethercrew.dev/db';

/**
 * Create a rawInfo entry in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo} rawInfo - The rawInfo object to be created.
 * @returns {Promise<IRawInfo>} - A promise that resolves to the created rawInfo object.
 */
async function createRawInfo(connection: Connection, rawInfo: IRawInfo): Promise<IRawInfo> {
  try {
    return await connection.models.RawInfo.create(rawInfo);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create rawInfo');
  }
}

/**
 * Create multiple rawInfo entries in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRawInfo[]} rawInfos - An array of rawInfo objects to be created.
 * @returns {Promise<IRawInfo[]>} - A promise that resolves to an array of the created rawInfo objects.
 */
async function createRawInfos(connection: Connection, rawInfos: IRawInfo[]): Promise<IRawInfo[]> {
  try {
    return await connection.models.RawInfo.insertMany(rawInfos, { ordered: false });
  } catch (error) {
    console.log(error);

    throw new Error('Failed to create rawInfos');
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
    console.log(error)
    throw new Error('Failed to retrieve rawInfo');
  }
}

/**
 * Get rawInfo entries from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entries.
 * @returns {Promise<IRawInfo[]>} - A promise that resolves to an array of the matching rawInfo objects.
 */
async function getRawInfos(connection: Connection, filter: object): Promise<IRawInfo[]> {
  try {
    return await connection.models.RawInfo.find(filter);
  } catch (error) {
    console.log(error)
    throw new Error('Failed to retrieve rawInfos');
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
    console.log(error)
    throw new Error('Failed to update rawInfo');
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
    console.log(error)
    throw new Error('Failed to update rawInfos');
  }
}

/**
 * Delete a rawInfo entry from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired rawInfo entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the rawInfo entry was successfully deleted, or false otherwise.
 * @throws {Error} - If there is an error while deleting the rawInfo entry.
 */
async function deleteRawInfo(connection: Connection, filter: object): Promise<boolean> {
  try {
    const deleteResult = await connection.models.RawInfo.deleteOne(filter);
    return deleteResult.deletedCount === 1;
  } catch (error) {
    throw new Error('Failed to delete rawInfo');
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
    console.log(error)
    throw new Error('Failed to delete rawInfos');
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
    console.log(error)
    throw new Error('Failed to retrieve rawInfo');
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
    console.log(error)
    throw new Error('Failed to retrieve rawInfo');
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
