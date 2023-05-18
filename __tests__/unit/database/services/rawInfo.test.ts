import mongoose, { Connection } from 'mongoose';
import { IRawInfo, rawInfoSchema } from 'tc_dbcomm';
import setupTestDB from '../../../utils/setupTestDB';
import {
  rawInfo1,
  rawInfo2,
  rawInfo3,
} from '../../../fixtures/rawInfo.fixture';
import { rawInfoService } from '../../../../src/database/services';
import config from '../../../../src/config';

setupTestDB();

describe('rawInfo service', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await mongoose.createConnection(config.mongoose.serverURL, {
      dbName: 'connection',
    });
    connection.model<IRawInfo>('RawInfo', rawInfoSchema);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.db.dropDatabase();
  });

  describe('createRawInfo', () => {
    test('should create a rawInfo', async () => {
      const result = await rawInfoService.createRawInfo(connection, rawInfo1);
      expect(result).toBeDefined();
      expect(result.messageId).toEqual(rawInfo1.messageId);
    });
  });

  describe('createRawInfos', () => {
    test('should create rawInfos (list of rawInfo)', async () => {
      const result = await rawInfoService.createRawInfos(connection, [
        rawInfo1,
        rawInfo2,
        rawInfo3,
      ]);
      expect(result).toMatchObject([rawInfo1, rawInfo2, rawInfo3]);
    });
  });

  describe('getRawInfo', () => {
    test('should retrieve an existing rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfo(connection, rawInfo3);
      const result = await rawInfoService.getRawInfo(connection, {
        messageId: rawInfo3.messageId,
      });
      expect(result).toMatchObject(rawInfo3);
    });

    test('should return null when no rawInfo matches the filter criteria', async () => {
      await rawInfoService.createRawInfo(connection, rawInfo3);
      const result = await rawInfoService.getRawInfo(connection, {
        role_mentions: ['role8'],
      });
      expect(result).toBeNull();
    });
  });

  describe('getRawInfos', () => {
    test('should retrieve rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfos(connection, [
        rawInfo1,
        rawInfo2,
        rawInfo3,
      ]);
      const result = await rawInfoService.getRawInfos(connection, {
        role_mentions: rawInfo2.role_mentions,
      });

      expect(result).toMatchObject([rawInfo1, rawInfo2]);
    });

    test('should return an empty array when no rawInfo matches the filter criteria', async () => {
      await rawInfoService.createRawInfos(connection, [
        rawInfo1,
        rawInfo2,
        rawInfo3,
      ]);
      const result = await rawInfoService.getRawInfos(connection, {
        role_mentions: ['role8'],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateRawInfo', () => {
    const patchPayload: IRawInfo = {
      channelId: 'channel1',
      messageId: 'message123',
      threadId: 'thread456',
      content: 'new content',
    };

    test('should update an existing rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfo(connection, rawInfo1);
      const result = await rawInfoService.updateRawInfo(
        connection,

        { messageId: rawInfo1.messageId },
        patchPayload
      );

      expect(result).toMatchObject(patchPayload);
    });

    test('should return null when no rawInfo matches the filter criteria', async () => {
      const result = await rawInfoService.updateRawInfo(
        connection,
        { messageId: rawInfo1.messageId },
        patchPayload
      );
      expect(result).toBeNull();
    });
  });

  describe('updateRawInfos', () => {
    const patchPayload: IRawInfo = {
      channelId: 'channel1',
      messageId: 'message123',
      threadId: 'thread456',
      content: 'new content',
    };

    test('should update rawInfos that match the filter criteria', async () => {
      await rawInfoService.createRawInfos(connection, [
        rawInfo1,
        rawInfo2,
        rawInfo3,
      ]);
      const result = await rawInfoService.updateManyRawInfo(
        connection,
        { messageId: rawInfo1.messageId },
        patchPayload
      );

      expect(result).toEqual(1);
      const rawInfo1Doc = await rawInfoService.getRawInfo(
        connection,
        patchPayload
      );

      expect(rawInfo1Doc?.content).toBe(patchPayload.content);
    });

    test('should return 0 when no rawInfos match the filter criteria', async () => {
      const result = await rawInfoService.updateManyRawInfo(
        connection,
        { content: rawInfo3.content },
        patchPayload
      );
      expect(result).toEqual(0);
    });
  });

  describe('deleteRawInfo', () => {
    test('should delete rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfo(connection, rawInfo1);
      const result = await rawInfoService.deleteRawInfo(connection, {
        content: rawInfo1.content,
      });
      expect(result).toEqual(true);
    });

    test('should return false when no rawInfo matches the filter criteria', async () => {
      const result = await rawInfoService.deleteRawInfo(connection, {
        content: rawInfo1.content,
      });
      expect(result).toEqual(false);
    });
  });

  describe('deleteRawInfos', () => {
    test('should delete rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfos(connection, [
        rawInfo1,
        rawInfo2,
        rawInfo3,
      ]);
      const result = await rawInfoService.deleteManyRawInfo(connection, {
        content: rawInfo1.content,
      });

      expect(result).toEqual(1);
    });

    test('should return 0 when no rawInfo matches the filter criteria', async () => {
      const result = await rawInfoService.deleteManyRawInfo(connection, {
        content: rawInfo1.content,
      });
      expect(result).toEqual(0);
    });
  });
});
