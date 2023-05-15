import { IRawInfo } from 'tc_dbcomm';

export const rawInfo1: IRawInfo = {
  type: 'message',
  author: 'John Doe',
  content: 'Hello, world!',
  datetime: '2023-05-15T12:00:00Z',
  user_mentions: ['user1', 'user2'],
  role_mentions: ['role1', 'role2'],
  reactions: ['reaction1', 'reaction2'],
  replied_user: 'user3',
  channelId: 'channel1',
  messageId: 'message123',
  threadId: 'thread456',
  thread: 'thread789',
};

export const rawInfo2: IRawInfo = {
  type: 'message',
  author: 'Alice Smith',
  content: "I'm excited for the upcoming event!",
  datetime: '2023-05-16T08:30:00Z',
  user_mentions: ['user4', 'user5'],
  role_mentions: ['role3', 'role4'],
  reactions: ['reaction3', 'reaction4'],
  replied_user: 'user6',
  channelId: 'channel789',
  messageId: 'message012',
  threadId: 'thread345',
  thread: 'Discussion Thread',
};

export const rawInfo3: IRawInfo = {
  type: 'message',
  author: 'Bob Johnson',
  content: 'Please review the document attached.',
  datetime: '2023-05-17T15:45:00Z',
  user_mentions: ['user7', 'user8'],
  role_mentions: ['role5', 'role6'],
  reactions: ['reaction5', 'reaction6'],
  replied_user: 'user9',
  channelId: 'channel987',
  messageId: 'message654',
  threadId: 'thread321',
  thread: 'Important Announcement',
};
