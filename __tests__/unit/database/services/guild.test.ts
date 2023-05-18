import { Guild, IGuildUpdateBody } from 'tc_dbcomm';
import { guildService } from '../../../../src/database/services';
import {
  insertManyGuilds,
  guild1,
  guild2,
} from '../../../fixtures/guid.fixture';
import setupTestDB from '../../../utils/setupTestDB';

setupTestDB();

describe('guildService', () => {
  describe('getGuild', () => {
    test('should retrieve an existing guild that matches the filter criteria', async () => {
      await insertManyGuilds([guild1]);
      const result = await guildService.getGuild({ guildId: guild1.guildId });

      expect(result).toMatchObject(guild1);
    });

    test('should return null when no guild matches the filter criteria', async () => {
      const result = await guildService.getGuild({});
      expect(result).toBeNull();
    });
  });

  describe('getGuilds', () => {
    test('should retrieve an existing guilds that matches the filter criteria', async () => {
      await insertManyGuilds([guild1, guild2]);
      const result = await guildService.getGuilds({ user: guild1.user });

      expect(result).toMatchObject([guild1, guild2]);
    });

    test('should return null when no guilds matches the filter criteria', async () => {
      const result = await guildService.getGuild({});
      expect(result).toBeNull();
    });
  });

  describe('updateGuild', () => {
    const updateBody: IGuildUpdateBody = {
      selectedChannels: [
        {
          channelId: '1233123213',
          channelName: 'test1',
        },
      ],
      isDisconnected: false,
    };
    test('should retrieve an existing guild that matches the filter criteria', async () => {
      await insertManyGuilds([guild1]);
      const result = await guildService.updateGuild(
        { guildId: guild1.guildId },
        updateBody
      );

      expect(result).toMatchObject({
        id: guild1?._id.toHexString(),
        guildId: guild1.guildId,
        isDisconnected: updateBody.isDisconnected,
        name: guild1.name,
        selectedChannels: updateBody.selectedChannels,
      });

      const dbGuild = await Guild.findById(guild1?._id);
      expect(dbGuild).toBeDefined();
      expect(dbGuild).toMatchObject({
        isDisconnected: updateBody.isDisconnected,
        selectedChannels: updateBody.selectedChannels,
      });
    });
    test('should return null when no guild matches the filter criteria', async () => {
      const result = await guildService.updateGuild(
        { guildId: 'notExistId' },
        updateBody
      );
      expect(result).toBeNull();
    });
  });

  describe('updateGuilds', () => {
    const updateBody: IGuildUpdateBody = {
      selectedChannels: [
        {
          channelId: '14151322',
          channelName: 'test2',
        },
      ],
      isDisconnected: false,
    };
    test('should retrieve an existing guild that matches the filter criteria', async () => {
      await insertManyGuilds([guild1, guild2]);
      const result = await guildService.updateManyGuilds(
        { user: guild1.user },
        updateBody
      );

      expect(result).toBe(2);
    });
    test('should return null when no guild matches the filter criteria', async () => {
      const result = await guildService.updateManyGuilds(
        { guildId: 'notExistId' },
        updateBody
      );

      expect(result).toBeNull(0);
    });
  });
});
