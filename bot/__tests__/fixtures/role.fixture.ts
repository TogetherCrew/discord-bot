import { IRole } from '@togethercrew.dev/db';
import { Connection } from 'mongoose';

export const role1: IRole = {
  roleId: '234567890123456777',
  name: 'Role 1',
  color: 123456,
};

export const role2: IRole = {
  roleId: '234567890123456787',
  name: 'Role 2',
  color: 654321,
};

export const role3: IRole = {
  roleId: '234567890123456797',
  name: 'Role 3',
  color: 654321,
};

export const insertRoles = async function <Type>(roles: Array<Type>, connection: Connection) {
  await connection.models.Role.insertMany(roles.map((role) => role));
};
