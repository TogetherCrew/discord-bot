import mongoose, { Connection } from 'mongoose';
import {
    IRole,
    roleSchema,
    IRoleUpdateBody,
} from '@togethercrew.dev/db';
import setupTestDB from '../../../utils/setupTestDB';
import {
    role1,
    role2,
    role3,
    insertRoles
} from '../../../fixtures/role.fixture';
import { roleService } from '../../../../src/database/services';
import config from '../../../../src/config';
setupTestDB();

describe('role service', () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await mongoose.createConnection(config.mongoose.serverURL, {
            dbName: 'connection',
        });
        connection.model<IRole>('Role', roleSchema);
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.db.dropDatabase();
    });

    describe('createRole', () => {
        test('should create a role', async () => {
            const result = await roleService.createRole(
                connection,
                role1
            );
            expect(result).toBeDefined();
            expect(result?.id).toEqual(role1.id);

            const roleDoc1 = await roleService.getRole(
                connection,
                { id: role1.id }
            );

            expect(roleDoc1).toBeDefined();
            expect(roleDoc1).toMatchObject({
                id: role1.id,
                name: role1.name,
                color: role1.color,
            });
        });
    });

    describe('createRoles', () => {
        test('should create roles', async () => {
            const result = await roleService.createRoles(connection, [
                role1,
                role2,
            ]);
            expect(result).toMatchObject([role1, role2]);

            const roleDoc1 = await roleService.getRole(
                connection,
                { id: role1.id }
            );

            const roleDoc2 = await roleService.getRole(
                connection,
                { id: role2.id }
            );

            expect(roleDoc1).toBeDefined();
            expect(roleDoc1).toMatchObject({
                id: role1.id,
                name: role1.name,
                color: role1.color,
            });
            expect(roleDoc2).toBeDefined();
            expect(roleDoc2).toMatchObject({
                id: role2.id,
                name: role2.name,
                color: role2.color,
            });
        });
    });

    describe('getRole', () => {
        test('should retrieve an existing role that match the filter criteria', async () => {
            await insertRoles([role1], connection);
            const result = await roleService.getRole(connection, {
                id: role1.id,
            });
            expect(result).toMatchObject(role1);
        });
        test('should return null when no role match the filter criteria', async () => {
            await insertRoles([role1], connection);
            const result = await roleService.getRole(connection, {
                id: role2.id,
            });
            expect(result).toBe(null);
        });
    });

    describe('getRoles', () => {
        test('should retrieve roles that match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection);
            const result = await roleService.getRoles(connection, {
                color: role2.color,
            });
            expect(result).toMatchObject([role2, role3]);
        });

        test('should return an empty array when no roles match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection);
            const result = await roleService.getRoles(connection, {
                color: 111111,
            });
            expect(result).toEqual([]);
        });
    });

    describe('updateRole', () => {
        const updateBody: IRoleUpdateBody = {
            name: 'Role 10',
            color: 111111
        };
        test('should update an existing role that match the filter criteria', async () => {
            await insertRoles([role1], connection);
            const result = await roleService.updateRole(
                connection,
                { id: role1.id },
                updateBody
            );
            expect(result).toMatchObject(updateBody);

            const roleDoc1 = await roleService.getRole(
                connection,
                { id: role1.id }
            );

            expect(roleDoc1).toBeDefined();
            expect(roleDoc1).toMatchObject({
                name: updateBody.name,
                color: updateBody.color,
            });
        });

        test('should return null when no role match the filter criteria', async () => {
            const result = await roleService.updateRole(
                connection,
                { id: role1.id },
                updateBody
            );
            expect(result).toEqual(null);
        });
    });

    describe('updateRoles', () => {
        const updateBody: IRoleUpdateBody = {
            color: 111111
        };
        test('should update roles that match the filter criteria', async () => {
            await insertRoles([role1, role2, role3], connection);
            const result = await roleService.updateRoles(
                connection,
                { color: role2.color },
                updateBody
            );
            expect(result).toEqual(2);
            const roleDoc1 = await roleService.getRole(
                connection,
                { id: role2.id }
            );
            const roleDoc12 = await roleService.getRole(
                connection,
                { id: role3.id }
            );
            expect(roleDoc1?.color).toBe(updateBody.color);
            expect(roleDoc12?.color).toBe(updateBody.color);
        });

        test('should return 0 when no roles match the filter criteria', async () => {
            const result = await roleService.updateRoles(
                connection,
                { color: role2.color },
                updateBody
            );
            expect(result).toEqual(0);
        });
    });

});
