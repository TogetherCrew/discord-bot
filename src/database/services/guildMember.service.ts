import { Connection } from 'mongoose';
import { IGuildMember, IGuildMemberUpdateBody } from 'tc_dbcomm';

/**
 * Create a guild member in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IGuildMember} guildMember - The guild member object to be created.
 * @returns {Promise<IGuildMember>} - A promise that resolves to the created guild member object.
 */
const createGuildMember = async (connection: Connection, guildMember: IGuildMember): Promise<IGuildMember> => {
    try {
        return await connection.models.GuildMember.create(guildMember);

    } catch (error) {
        console.log(error)
        throw new Error('Failed to create guild member');
    }
};


/**
 * Create guild members in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IGuildMember[]} guildMembers - An array of guild member objects to be created.
 * @returns {Promise<IGuildMember[]>} - A promise that resolves to an array of the created guild member objects.
 */
async function createGuildMembers(connection: Connection, guildMembers: IGuildMember[]): Promise<IGuildMember[]> {
    try {
        return await connection.models.GuildMember.insertMany(guildMembers.map((guildMember) => guildMember));

    } catch (error) {
        throw new Error('Failed to create guild members');
    }
}


/**
 * Get a guild member from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry.
 * @returns {Promise<IGuildMember | null>} - A promise that resolves to the matching guild member object or null if not found.
 */
async function getGuildMember(connection: Connection, filter: object): Promise<IGuildMember | null> {
    try {
        return await connection.models.GuildMember.findOne(filter);
    } catch (error) {
        throw new Error('Failed to retrieve guild member');
    }
}

/**
 * Get guild members from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entries.
 * @returns {Promise<IGuildMember[]>} - A promise that resolves to an array of the matching guild member objects.
 */
async function getGuildMembers(connection: Connection, filter: object): Promise<IGuildMember[]> {
    try {
        return await connection.models.GuildMember.find(filter);
    } catch (error) {
        throw new Error('Failed to retrieve guild members');
    }
}

/**
 * Update a guild member in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry.
 * @param {IGuildMemberUpdateBody} UpdateBody - An object containing the updated guild member data.
 * @returns {Promise<IGuildMember | null>} - A promise that resolves to the updated guild member object or null if not found.
 */
async function updateGuildMember(connection: Connection, filter: object, UpdateBody: IGuildMemberUpdateBody): Promise<IGuildMember | null> {
    try {
        const guildMember = await connection.models.GuildMember.findOne(filter);
        if (!guildMember) {
            return null;
        }
        Object.assign(guildMember, UpdateBody);
        return await guildMember.save();
    } catch (error) {
        throw new Error('Failed to update guild member');
    }
}

/**
 * Update multiple guild members in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple guild member entries.
 * @param {IGuildMemberUpdateBody} UpdateBody - An object containing the updated guild member data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated guild member entries.
 */
async function updateGuildMembers(connection: Connection, filter: object, UpdateBody: IGuildMemberUpdateBody): Promise<number> {
    try {
        const updateResult = await connection.models.GuildMember.updateMany(filter, UpdateBody);
        return updateResult.modifiedCount || 0;
    } catch (error) {
        throw new Error('Failed to update guild members');
    }
}

/**
 * Delete a guild member from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired guild member entry for deletion.
 * @returns {Promise<boolean>} - A promise that resolves to true if the guild member was successfully deleted, or false otherwise.
 * @throws {Error} - If there is an error while deleting the guild member.
 */
async function deleteGuildMember(connection: Connection, filter: object): Promise<boolean> {
    try {
        const deleteResult = await connection.models.GuildMember.deleteOne(filter);
        return deleteResult.deletedCount === 1;
    } catch (error) {
        throw new Error('Failed to delete guild member');
    }
}

/**
 * Delete multiple guild members from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple guild member entries for deletion.
 * @returns {Promise<number>} - A promise that resolves to the number of deleted guild member entries.
 * @throws {Error} - If there is an error while deleting the guild members.
 */
async function deleteGuildMembers(connection: Connection, filter: object): Promise<number> {
    try {
        const deleteResult = await connection.models.GuildMember.deleteMany(filter);
        return deleteResult.deletedCount;
    } catch (error) {
        throw new Error('Failed to delete guild members');
    }

}

export default {
    createGuildMember,
    createGuildMembers,
    updateGuildMember,
    getGuildMember,
    getGuildMembers,
    updateGuildMembers,
    deleteGuildMember,
    deleteGuildMembers
};