/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { type Connection } from 'mongoose'
import {
    type IRole,
    type IRoleMethods,
    type IRoleUpdateBody,
} from '@togethercrew.dev/db'
import { type Role } from 'discord.js'
import parentLogger from '../../config/logger'

const logger = parentLogger.child({ module: 'roleService' })
/**
 * Create a role in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole} role - The role object to be created.
 * @returns {Promise<IRole|null>} - A promise that resolves to the created role object.
 */
async function createRole(
    connection: Connection,
    role: IRole
): Promise<IRole | null> {
    try {
        return await connection.models.Role.create(role)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // if (error.code === 11000) {
        //   logger.warn({ database: connection.name, role_id: role.roleId }, 'Failed to create duplicate role');
        //   return null;
        // }
        // logger.error({ database: connection.name, role_id: role.roleId, error }, 'Failed to create role');
        return null
    }
}

/**
 * Create roles in the database.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {IRole[]} roles - An array of role objects to be created.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the created role objects.
 */
async function createRoles(
    connection: Connection,
    roles: IRole[]
): Promise<IRole[] | []> {
    try {
        return await connection.models.Role.insertMany(roles, {
            ordered: false,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // if (error.code === 11000) {
        //   logger.warn({ database: connection.name }, 'Failed to create duplicate roles');
        //   return [];
        // }
        // logger.error({ database: connection.name, error }, 'Failed to create roles');
        return []
    }
}

/**
 * Get a role from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @returns {Promise<IRole | null>} - A promise that resolves to the matching role object or null if not found.
 */
async function getRole(
    connection: Connection,
    filter: object
): Promise<(IRole & IRoleMethods) | null> {
    return await connection.models.Role.findOne(filter)
}

/**
 * Get roles from the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entries.
 * @returns {Promise<IRole[] | []>} - A promise that resolves to an array of the matching role objects.
 */
async function getRoles(
    connection: Connection,
    filter: object
): Promise<IRole[] | []> {
    return await connection.models.Role.find(filter)
}

/**
 * Update a role in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match the desired role entry.
 * @param {IRoleUpdateBody} updateBody - An object containing the updated role data.
 * @returns {Promise<IRole | null>} - A promise that resolves to the updated role object or null if not found.
 */
async function updateRole(
    connection: Connection,
    filter: object,
    updateBody: IRoleUpdateBody
): Promise<IRole | null> {
    try {
        const role = await connection.models.Role.findOne(filter)
        if (role === null) {
            return null
        }
        Object.assign(role, updateBody)
        await role.save()
        return role
    } catch (error) {
        logger.error(
            { database: connection.name, filter, updateBody, error },
            'Failed to update role'
        )
        return null
    }
}

/**
 * Update multiple roles in the database based on the filter criteria.
 * @param {Connection} connection - Mongoose connection object for the database.
 * @param {object} filter - An object specifying the filter criteria to match multiple role entries.
 * @param {IRoleUpdateBody} updateBody - An object containing the updated role data.
 * @returns {Promise<number>} - A promise that resolves to the number of updated role entries.
 */
async function updateRoles(
    connection: Connection,
    filter: object,
    updateBody: IRoleUpdateBody
): Promise<number> {
    try {
        const updateResult = await connection.models.Role.updateMany(
            filter,
            updateBody
        )
        return updateResult.modifiedCount || 0
    } catch (error) {
        logger.error(
            { database: connection.name, filter, updateBody, error },
            'Failed to update roles'
        )
        return 0
    }
}

/**
 * Handle the logic for creating or updating roles in the database.
 * @param {Connection} connection - Mongoose connection object for the specific guild database.
 * @param {Role} role - The Discord.js Role object containing the role details.
 * @returns {Promise<void>} - A promise that resolves when the create or update operation is complete.
 *
 */
async function handelRoleChanges(
    connection: Connection,
    role: Role
): Promise<void> {
    const commonFields = getNeededDateFromRole(role)
    try {
        const roleDoc = await updateRole(
            connection,
            { roleId: role.id },
            commonFields
        )
        if (roleDoc === null) {
            await createRole(connection, commonFields)
        }
    } catch (error) {
        logger.error(
            { guild_id: connection.name, role_id: role.id, error },
            'Failed to handle role changes'
        )
    }
}

/**
 * Extracts necessary fields from a Discord.js Role object to form an IRole object.
 * @param {Role} guildMember - The Discord.js Role object containing the full role details.
 * @returns {IRole} - An object that adheres to the Role interface, containing selected fields from the provided role.
 */
function getNeededDateFromRole(role: Role): IRole {
    return {
        roleId: role.id,
        name: role.name,
        color: role.color,
    }
}

export default {
    createRole,
    createRoles,
    updateRole,
    getRole,
    getRoles,
    updateRoles,
    handelRoleChanges,
    getNeededDateFromRole,
}
