import mongoose, { Connection } from 'mongoose';
import { IRawInfo, IRawInfoUpdateBody, rawInfoSchema } from 'tc_dbcomm';
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

      const rawInfoDoc1 = await rawInfoService.getRawInfo(connection, {
        channelId: rawInfo1.channelId,
      });

      expect(rawInfoDoc1).toBeDefined();
      expect(rawInfoDoc1).toMatchObject({
        author: rawInfo1.author,
        messageId: rawInfo1.messageId,
      });
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

      const rawInfoDoc1 = await rawInfoService.getRawInfo(connection, {
        channelId: rawInfo1.channelId,
      });
      const rawInfoDoc2 = await rawInfoService.getRawInfo(connection, {
        channelId: rawInfo2.channelId,
      });
      const rawInfoDoc3 = await rawInfoService.getRawInfo(connection, {
        channelId: rawInfo3.channelId,
      });

      expect([rawInfoDoc1, rawInfoDoc2, rawInfoDoc3]).toBeDefined();
      expect(rawInfoDoc1).toMatchObject({
        author: rawInfo1.author,
        messageId: rawInfo1.messageId,
      });
      expect(rawInfoDoc2).toMatchObject({
        author: rawInfo2.author,
        messageId: rawInfo2.messageId,
      });
      expect(rawInfoDoc3).toMatchObject({
        author: rawInfo3.author,
        messageId: rawInfo3.messageId,
      });
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
    const updateBody: IRawInfoUpdateBody = {
      channelId: 'channel1',
      threadId: 'thread456',
    };

    test('should update an existing rawInfo that matches the filter criteria', async () => {
      await rawInfoService.createRawInfo(connection, rawInfo1);

      const result = await rawInfoService.updateRawInfo(
        connection,
        { messageId: rawInfo1.messageId },
        updateBody
      );

      expect(result).toMatchObject(updateBody);

      const updatedRawInfoDoc = await rawInfoService.getRawInfo(connection, {
        channelId: updateBody.channelId,
      });

      expect(updatedRawInfoDoc).toBeDefined();
      expect(updatedRawInfoDoc).toMatchObject({
        channelId: updateBody.channelId,
        threadId: updateBody.threadId,
      });
    });

    test('should return null when no rawInfo matches the filter criteria', async () => {
      const result = await rawInfoService.updateRawInfo(
        connection,
        { messageId: rawInfo1.messageId },
        updateBody
      );
      expect(result).toBeNull();
    });
  });

  describe('updateRawInfos', () => {
    const updateBody: IRawInfoUpdateBody = {
      channelId: 'channel1',
      threadId: 'thread100000',
    };

    test('should update rawInfos that match the filter criteria', async () => {
      await rawInfoService.createRawInfos(connection, [rawInfo1, rawInfo2]);
      const result = await rawInfoService.updateManyRawInfo(
        connection,
        { role_mentions: rawInfo1.role_mentions },
        updateBody
      );

      expect(result).toEqual(2);
      const rawInfo1Doc = await rawInfoService.getRawInfo(
        connection,
        updateBody
      );
      const rawInfo2Doc = await rawInfoService.getRawInfo(
        connection,
        updateBody
      );

      expect(rawInfo1Doc).toMatchObject({
        channelId: updateBody.channelId,
        threadId: updateBody.threadId,
      });
      expect(rawInfo2Doc).toMatchObject({
        channelId: updateBody.channelId,
        threadId: updateBody.threadId,
      });
    });

    test('should return 0 when no rawInfos match the filter criteria', async () => {
      const result = await rawInfoService.updateManyRawInfo(
        connection,
        { content: rawInfo3.content },
        updateBody
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
