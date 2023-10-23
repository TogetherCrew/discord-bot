"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../config/logger"));
const logger = logger_1.default.child({ module: 'roleService' });
/**
 * Create a role in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole} role - The role object to be created.
 * @returns {Promise<IRole|null>} - A promise that resolves to the created role object.
 */
async function createRole(connection, role) {
    try {
        return await connection.models.Role.create(role);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.code == 11000) {
            logger.warn({ database: connection.name, role_id: role.roleId }, 'Failed to create duplicate role');
            return null;
        }
        logger.error({ database: connection.name, role_id: role.roleId, error }, 'Failed to create role');
        return null;
    }
}
/**
 * Create roles in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole[]} roles - An array of role objects to be created.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the created role objects.
 */
async function createRoles(connection, roles) {
    try {
        return await connection.models.Role.insertMany(roles, { ordered: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        if (error.code == 11000) {
            logger.warn({ database: connection.name }, 'Failed to create duplicate roles');
            return [];
        }
        logger.error({ database: connection.name, error }, 'Failed to create roles');
        return [];
    }
}
/**
 * Get a role from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @returns {Promise<IRole | null>} - A promise that resolves to the matching role object or null if not found.
 */
async function getRole(connection, filter) {
    return await connection.models.Role.findOne(filter);
}
/**
 * Get roles from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entries.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the matching role objects.
 */
async function getRoles(connection, filter) {
    return await connection.models.Role.find(filter);
}
/**
 * Update a role in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @param {IRoleUpdateBody} updateBody - An object containing the updated role data.
 * @returns {Promise<IRole | null>} - A promise that resolves to the updated role object or null if not found.
 */
async function updateRole(connection, filter, updateBody) {
    try {
        const role = await connection.models.Role.findOne(filter);
        if (!role) {
            return null;
        }
        Object.assign(role, updateBody);
        return await role.save();
    }
    catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update role');
        return null;
    }
}
/**
 * Update multiple roles in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple role entries.
 * @param {IRoleUpdateBody} updateBody - An object containing the updated role data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated role entries.
 */
async function updateRoles(connection, filter, updateBody) {
    try {
        const updateResult = await connection.models.Role.updateMany(filter, updateBody);
        return updateResult.modifiedCount || 0;
    }
    catch (error) {
        logger.error({ database: connection.name, filter, updateBody, error }, 'Failed to update roles');
        return 0;
    }
}
/**
 * Handle the logic for creating or updating roles in the database.
 * @param {Connection} connection - Mongoose connection object for the specific guild database.
 * @param {Role} role - The Discord.js Role object containing the role details.
 * @returns {Promise<void>} - A promise that resolves when the create or update operation is complete.
 *
 */
async function handelRoleChanges(connection, role) {
    const commonFields = getNeededDateFromRole(role);
    try {
        const roleDoc = await updateRole(connection, { roleId: role.id }, commonFields);
        if (!roleDoc) {
            await createRole(connection, commonFields);
        }
    }
    catch (error) {
        logger.error({ guild_id: connection.name, role_id: role.id, error }, 'Failed to handle role changes');
    }
}
/**
 * Extracts necessary fields from a Discord.js Role object to form an IRole object.
 * @param {Role} guildMember - The Discord.js Role object containing the full role details.
 * @returns {IRole} - An object that adheres to the Role interface, containing selected fields from the provided role.
 */
function getNeededDateFromRole(role) {
    return {
        roleId: role.id,
        name: role.name,
        color: role.color,
    };
}
exports.default = {
    createRole,
    createRoles,
    updateRole,
    getRole,
    getRoles,
    updateRoles,
    handelRoleChanges,
    getNeededDateFromRole,
};
