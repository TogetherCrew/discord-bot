import { IRawInfo } from '@togethercrew.dev/db';

export const rawInfo1: IRawInfo = {
  type: 0,
  author: 'John Doe',
  content: 'Hello, world!',
  createdDate: new Date(),
  user_mentions: ['user1', 'user2'],
  role_mentions: ['role1', 'role2'],
  reactions: ['reaction1', 'reaction2'],
  replied_user: 'user3',
  channelId: 'channel1',
  messageId: 'message123',
  threadId: 'thread456',
  threadName: 'thread789',
  channelName: 'c1',
};

export const rawInfo2: IRawInfo = {
  type: 1,
  author: 'Alice Smith',
  content: "I'm excited for the upcoming event!",
  createdDate: new Date(),
  user_mentions: ['user4', 'user5'],
  role_mentions: ['role1', 'role2'],
  reactions: ['reaction3', 'reaction4'],
  replied_user: 'user6',
  channelId: 'channel789',
  messageId: 'message012',
  threadId: 'thread345',
  threadName: 'Discussion Thread',
  channelName: 'c2',
};

export const rawInfo3: IRawInfo = {
  type: 2,
  author: 'Bob Johnson',
  content: 'Please review the document attached.',
  createdDate: new Date(),
  user_mentions: ['user7', 'user8'],
  role_mentions: ['role5', 'role6'],
  reactions: ['reaction5', 'reaction6'],
  replied_user: 'user9',
  channelId: 'channel987',
  messageId: 'message654',
  threadId: 'thread321',
  threadName: 'Important Announcement',
  channelName: 'c3',
};
