import { IGuildMember } from 'tc_dbcomm';

export const guildMember1: IGuildMember = {
    discordId: '123456789',
    nick: 'JohnDoe',
    roles: ['role1', 'role2'],
    joined_at: '2023-05-01',
};

export const guildMember2: IGuildMember = {
    discordId: '987654321',
    nick: 'JaneSmith',
    roles: ['role1', 'role2'],
    joined_at: '2023-05-02',
};

export const guildMember3: IGuildMember = {
    discordId: '555555555',
    nick: 'AliceJohnson',
    roles: ['role2', 'role5'],
    joined_at: '2023-05-03',
};