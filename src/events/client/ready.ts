import { Events, Client } from 'discord.js';
import { connectDB } from '../../database';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        console.log(`Ready! Logged in as ${client.user?.tag}`);
        connectDB();
    }
}