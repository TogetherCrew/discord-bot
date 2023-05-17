import { Events, Client } from 'discord.js';
import { guildMemberService } from '../../database/services';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    execute(member: any) {
        console.log('1')
        console.log(member);
        console.log('****************************')
        console.log(member.guild)
        console.log(member.user)

        // guildMemberService.createGuildMember()
    }
}

// User {
//     id: '1069192371218169876',
//     bot: true,
//     system: false,
//     flags: UserFlagsBitField { bitfield: 0 },
//     username: 'RnDAO',
//     discriminator: '3270',
//     avatar: null,
//     banner: undefined,
//     accentColor: undefined
//   }
  
// export interface IGuildMember {
//     discordId?: Snowflake;
//     nick?: string;
//     avatar?: string;
//     roles: Snowflake[];
//     joined_at: string;
//   }