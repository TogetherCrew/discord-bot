import { Connection } from 'mongoose'
import { IRoleUpdateBody, DatabaseManager } from '@togethercrew.dev/db'
import setupTestDB from '../../../utils/setupTestDB'
import { role1, role2, role3, insertRoles } from '../../../fixtures/role.fixture'
import { roleService } from '../../../../src/database/services'
setupTestDB()

describe('role service', () => {
    let connection: Connection
    beforeAll(async () => {
        connection = await DatabaseManager.getInstance().getGuildDb('connection-4')
    })
    afterAll(async () => {
        await connection.close()
    })
    beforeEach(async () => {
        await connection.collection('roles').deleteMany({})
    })
    describe('createRole', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        test('should create a role', async () => {
            const result = await roleService.createRole(connection, role1)
            expect(result).toBeDefined()
            expect(result?.roleId).toEqual(role1.roleId)

            const roleDoc1 = await roleService.getRole(connection, {
                roleId: role1.roleId,
            })

            expect(roleDoc1).toBeDefined()
            expect(roleDoc1).toMatchObject({
                roleId: role1.roleId,
                name: role1.name,
                color: role1.color,
            })
        })
    })

    describe('createRoles', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        test('should create roles', async () => {
            const result = await roleService.createRoles(connection, [role1, role2])
            expect(result).toMatchObject([role1, role2])

            const roleDoc1 = await roleService.getRole(connection, {
                roleId: role1.roleId,
            })

            const roleDoc2 = await roleService.getRole(connection, {
                roleId: role2.roleId,
            })

            expect(roleDoc1).toBeDefined()
            expect(roleDoc1).toMatchObject({
                roleId: role1.roleId,
                name: role1.name,
                color: role1.color,
            })
            expect(roleDoc2).toBeDefined()
            expect(roleDoc2).toMatchObject({
                roleId: role2.roleId,
                name: role2.name,
                color: role2.color,
            })
        })
    })

    describe('getRole', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        test('should retrieve an existing role that match the filter criteria', async () => {
            await insertRoles([role1], connection)
            const result = await roleService.getRole(connection, {
                roleId: role1.roleId,
            })
            expect(result).toMatchObject(role1)
        })
        test('should return null when no role match the filter criteria', async () => {
            await insertRoles([role1], connection)
            const result = await roleService.getRole(connection, {
                roleId: role2.roleId,
            })
            expect(result).toBe(null)
        })
    })

    describe('getRoles', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        test('should retrieve roles that match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection)
            const result = await roleService.getRoles(connection, {
                color: role2.color,
            })
            expect(result).toMatchObject([role2, role3])
        })

        test('should return an empty array when no roles match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection)
            const result = await roleService.getRoles(connection, {
                color: 111111,
            })
            expect(result).toEqual([])
        })
    })

    describe('updateRole', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        const updateBody: IRoleUpdateBody = {
            name: 'Role 10',
            color: 111111,
        }
        test('should update an existing role that match the filter criteria', async () => {
            await insertRoles([role1], connection)
            const result = await roleService.updateRole(connection, { roleId: role1.roleId }, updateBody)
            expect(result).toMatchObject(updateBody)

            const roleDoc1 = await roleService.getRole(connection, {
                roleId: role1.roleId,
            })

            expect(roleDoc1).toBeDefined()
            expect(roleDoc1).toMatchObject({
                name: updateBody.name,
                color: updateBody.color,
            })
        })

        test('should return null when no role match the filter criteria', async () => {
            const result = await roleService.updateRole(connection, { roleId: role1.roleId }, updateBody)
            expect(result).toEqual(null)
        })
    })

    describe('updateRoles', () => {
        beforeEach(async () => {
            await connection.collection('roles').deleteMany({})
        })
        const updateBody: IRoleUpdateBody = {
            color: 111111,
        }
        test('should update roles that match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection)
            const result = await roleService.updateRoles(connection, { color: role2.color }, updateBody)
            expect(result).toEqual(2)
            const roleDoc1 = await roleService.getRole(connection, {
                roleId: role2.roleId,
            })
            const roleDoc12 = await roleService.getRole(connection, {
                roleId: role3.roleId,
            })
            expect(roleDoc1?.color).toBe(updateBody.color)
            expect(roleDoc12?.color).toBe(updateBody.color)
        })

        test('should return 0 when no roles match the filter criteria', async () => {
            const result = await roleService.updateRoles(connection, { color: role2.color }, updateBody)
            expect(result).toEqual(0)
        })
    })
})
