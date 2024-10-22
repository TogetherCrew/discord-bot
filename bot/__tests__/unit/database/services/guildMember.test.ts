import mongoose, { Connection } from 'mongoose';
import {
  IGuildMember,
  guildMemberSchema,
  IGuildMemberUpdateBody,
  DatabaseManager,
  GuildMember,
} from '@togethercrew.dev/db';
import setupTestDB from '../../../utils/setupTestDB';
import { guildMember1, guildMember2, guildMember3 } from '../../../fixtures/guildMember.fixture';
import { guildMemberService } from '../../../../src/database/services';
import config from '../../../../src/config';
setupTestDB();

describe('guildMember service', () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await DatabaseManager.getInstance().getGuildDb('connection-2');
  });
  afterAll(async () => {
    await connection.close();
  });
  beforeEach(async () => {
    await connection.collection('guildmembers').deleteMany({});
  });
  describe('createGuidMember', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should create a guild member', async () => {
      const result = await guildMemberService.createGuildMember(connection, guildMember1);
      expect(result).toBeDefined();
      expect(result?.discordId).toEqual(guildMember1.discordId);

      const guildMemberDoc1 = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember1.discordId,
      });

      expect(guildMemberDoc1).toBeDefined();
      expect(guildMemberDoc1).toMatchObject({
        discordId: guildMember1.discordId,
        username: guildMember1.username,
      });
    });
  });

  describe('createGuidMembers', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should create guild members', async () => {
      const result = await guildMemberService.createGuildMembers(connection, [guildMember1, guildMember2]);
      expect(result).toMatchObject([guildMember1, guildMember2]);

      const guildMemberDoc1 = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember1.discordId,
      });

      const guildMemberDoc2 = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember2.discordId,
      });

      expect(guildMemberDoc1).toBeDefined();
      expect(guildMemberDoc1).toMatchObject({
        discordId: guildMember1.discordId,
        username: guildMember1.username,
      });
      expect(guildMemberDoc2).toBeDefined();
      expect(guildMemberDoc2).toMatchObject({
        discordId: guildMember2.discordId,
        username: guildMember2.username,
      });
    });
  });

  describe('getGuildMember', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should retrieve an existing guild member that match the filter criteria', async () => {
      await guildMemberService.createGuildMember(connection, guildMember1);
      const result = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember1.discordId,
      });
      expect(result).toMatchObject(guildMember1);
    });
    test('should return null when no guild members match the filter criteria', async () => {
      await guildMemberService.createGuildMember(connection, guildMember1);
      const result = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember2.discordId,
      });
      expect(result).toBe(null);
    });
  });

  describe('getGuildMembers', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should retrieve guild members that match the filter criteria', async () => {
      await guildMemberService.createGuildMembers(connection, [guildMember1, guildMember2, guildMember3]);
      const result = await guildMemberService.getGuildMembers(connection, {
        roles: guildMember2.roles,
      });
      expect(result).toMatchObject([guildMember1, guildMember2]);
    });

    test('should return an empty array when no guild members match the filter criteria', async () => {
      await guildMemberService.createGuildMembers(connection, [guildMember1, guildMember2, guildMember3]);
      const result = await guildMemberService.getGuildMembers(connection, {
        roles: ['role8'],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateGuildMember', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    const updateBody: IGuildMemberUpdateBody = {
      username: 'userName',
      avatar: 'new-avatar.png',
      roles: ['role1Id', 'role21Id'],
    };
    test('should update an existing guild member that match the filter criteria', async () => {
      await guildMemberService.createGuildMember(connection, guildMember1);
      const result = await guildMemberService.updateGuildMember(
        connection,
        { discordId: guildMember1.discordId },
        updateBody,
      );

      expect(result).toMatchObject(updateBody);

      const guildMember1Doc = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember1.discordId,
      });

      expect(guildMember1Doc).toBeDefined();
      expect(guildMember1Doc).toMatchObject({
        username: updateBody.username,
        avatar: updateBody.avatar,
        roles: updateBody.roles,
      });
    });

    test('should return null when no guild member match the filter criteria', async () => {
      const result = await guildMemberService.updateGuildMember(connection, { discordId: '1' }, updateBody);
      expect(result).toEqual(null);
    });
  });

  describe('updateGuildMembers', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    const updateBody: IGuildMemberUpdateBody = {
      avatar: 'new-avatar.png',
    };
    test('should update guild members that match the filter criteria', async () => {
      await guildMemberService.createGuildMembers(connection, [guildMember1, guildMember2, guildMember3]);
      const result = await guildMemberService.updateGuildMembers(connection, { roles: guildMember2.roles }, updateBody);
      expect(result).toEqual(2);
      const guildMember1Doc = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember1.discordId,
      });
      const guildMember2Doc = await guildMemberService.getGuildMember(connection, {
        discordId: guildMember2.discordId,
      });
      expect(guildMember1Doc?.avatar).toBe(updateBody.avatar);
      expect(guildMember2Doc?.avatar).toBe(updateBody.avatar);
    });

    test('should return 0 when no guild members match the filter criteria', async () => {
      const result = await guildMemberService.updateGuildMembers(connection, { roles: guildMember2.roles }, updateBody);
      expect(result).toEqual(0);
    });
  });

  describe('deleteGuildMember', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should delete guild member that match the filter criteria', async () => {
      await guildMemberService.createGuildMember(connection, guildMember1);
      const result = await guildMemberService.deleteGuildMember(connection, {
        discordId: guildMember1.discordId,
      });
      expect(result).toEqual(true);
    });

    test('should return false when no guild members match the filter criteria', async () => {
      const result = await guildMemberService.deleteGuildMember(connection, {
        discordId: guildMember1.discordId,
      });
      expect(result).toEqual(false);
    });
  });

  describe('deleteGuildMembers', () => {
    beforeEach(async () => {
      await connection.collection('guildmembers').deleteMany({});
    });
    test('should delete guild members that match the filter criteria', async () => {
      await guildMemberService.createGuildMembers(connection, [guildMember1, guildMember2, guildMember3]);
      const result = await guildMemberService.deleteGuildMembers(connection, {
        roles: guildMember2.roles,
      });
      expect(result).toEqual(2);
    });

    test('should return 0 when no guild members match the filter criteria', async () => {
      const result = await guildMemberService.deleteGuildMembers(connection, {
        roles: guildMember2.roles,
      });
      expect(result).toEqual(0);
    });
  });
});
