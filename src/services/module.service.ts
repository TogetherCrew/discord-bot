import { type HydratedDocument } from 'mongoose';
import { Module, type IModule } from '@togethercrew.dev/db';

/**
 * Get module by filter
 * @param {Object} filter - Mongo filter
 * @returns {Promise<HydratedDocument<IModule> | null>}
 */
const getModuleByFilter = async (filter: object): Promise<HydratedDocument<IModule> | null> => {
    return Module.findOne(filter);
};



export default {
    getModuleByFilter,
};
