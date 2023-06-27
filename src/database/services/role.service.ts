import { Connection } from 'mongoose';
import { IRole, IRoleUpdateBody } from '@togethercrew.dev/db';

/**
 * Create a role in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole} role - The role object to be created.
 * @returns {Promise<IRole|null>} - A promise that resolves to the created role object.
 */
async function createRole(connection: Connection, role: IRole): Promise<IRole | null> {
    try {
        return await connection.models.Role.create(role);
    } catch (error) {
        console.log('Failed to create role', error);
        return null;
    }
}

/**
 * Create roles in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole[]} roles - An array of role objects to be created.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the created role objects.
 */
async function createRoles(connection: Connection, roles: IRole[]): Promise<IRole[] | []> {
    try {
        return await connection.models.Role.insertMany(roles, { ordered: false });
    } catch (error) {
        console.log('Failed to create roles', error);
        return [];
    }
}

/**
 * Get a role from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @returns {Promise<IRole | null>} - A promise that resolves to the matching role object or null if not found.
 */
async function getRole(connection: Connection, filter: object): Promise<IRole | null> {
    try {
        return await connection.models.Role.findOne(filter);
    } catch (error) {
        console.log('Failed to retrieve  role', error);
        return null;
    }
}

/**
 * Get roles from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entries.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the matching role objects.
 */
async function getRoles(connection: Connection, filter: object): Promise<IRole[] | []> {
    try {
        return await connection.models.Role.find(filter);
    } catch (error) {
        console.log('Failed to retrieve  roles', error);
        return [];
    }
}

/**
 * Update a role in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @param {IRoleUpdateBody} UpdateBody - An object containing the updated role data.
 * @returns {Promise<IRole | null>} - A promise that resolves to the updated role object or null if not found.
 */
async function updateRole(
    connection: Connection,
    filter: object,
    UpdateBody: IRoleUpdateBody
): Promise<IRole | null> {
    try {
        const role = await connection.models.Role.findOne(filter);
        if (!role) {
            return null;
        }
        Object.assign(role, UpdateBody);
        return await role.save();
    } catch (error) {
        console.log('Failed to update role', error);
        return null;
    }
}

/**
 * Update multiple roles in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple role entries.
 * @param {IRoleUpdateBody} UpdateBody - An object containing the updated role data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated role entries.
 */
async function updateRoles(
    connection: Connection,
    filter: object,
    UpdateBody: IRoleUpdateBody
): Promise<number> {
    try {
        const updateResult = await connection.models.Role.updateMany(filter, UpdateBody);
        return updateResult.modifiedCount || 0;
    } catch (error) {
        console.log('Failed to update roles', error);
        return 0;
    }
}

export default {
    createRole,
    createRoles,
    updateRole,
    getRole,
    getRoles,
    updateRoles,
};
