import { IGuildMember } from '@togethercrew.dev/db'

export const guildMember1: IGuildMember = {
    discordId: '123456789',
    username: 'JohnDoe',
    roles: ['role1Id', 'role2Id'],
    joinedAt: new Date('2023-05-01'),
    discriminator: '1',
    isBot: false,
    avatar: 'a1',
    permissions: '137411140513358n',
}

export const guildMember2: IGuildMember = {
    discordId: '987654321',
    username: 'JaneSmith',
    roles: ['role1Id', 'role2Id'],
    joinedAt: new Date('2023-05-01'),
    discriminator: '2',
    isBot: true,
    avatar: 'a2',
    permissions: '137411140513357n',
}

export const guildMember3: IGuildMember = {
    discordId: '555555555',
    username: 'AliceJohnson',
    roles: ['role2Id', 'role5Id'],
    joinedAt: new Date('2023-05-03'),
    discriminator: '3',
    isBot: false,
    avatar: 'a3',
    permissions: '137411140513356n',
}
