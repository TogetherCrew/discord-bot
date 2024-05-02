import { type HydratedDocument } from 'mongoose';
import { Platform, type IPlatform } from '@togethercrew.dev/db';

/**
 * Get platform by filter
 * @param {Object} filter - Mongo filter
 * @returns {Promise<HydratedDocument<IPlatform> | null>}
 */
const getPlatformByFilter = async (filter: object): Promise<HydratedDocument<IPlatform> | null> => {
    return await Platform.findOne(filter);
};

export default {
    getPlatformByFilter,
};
