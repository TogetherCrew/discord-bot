/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from 'discord.js';
import { interactionService } from '../../services'
import RabbitMQ, { Event, Queue as RabbitMQQueue } from '@togethercrew.dev/tc-messagebroker';
import { ChatInputCommandInteraction_broker } from '../../interfaces/Hivemind.interface';

export default {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Ask a question and get an answer from Hivemind!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question to Hivemind')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction_broker) {
        if (!interaction.member?.roles.cache.has("1166350549889859657")) {
            return await interactionService.createInteractionResponse(interaction, { type: 4, data: { content: 'You do not have the required role to use this command!', flags: 64 } })
        }


        const serializedInteraction = interactionService.constructSerializableInteraction(interaction);
        const processedInteraction = handleBigInts(serializedInteraction);
        const cleanInteraction = removeCircularReferences(processedInteraction); // Pass processedInteraction here
        const serializedData = JSON.stringify(cleanInteraction, null, 2);
        RabbitMQ.publish(RabbitMQQueue.HIVEMIND, Event.HIVEMIND.INTERACTION_CREATED, { interaction: serializedData });
    },
};


function handleBigInts(obj: any, seen = new WeakSet()): any {
    if (typeof obj === 'bigint') {
        return obj.toString(); // Convert BigInt to a string
    } else if (Array.isArray(obj)) {
        return obj.map((item) => handleBigInts(item, seen)); // Process arrays element-wise
    } else if (typeof obj === 'object' && obj !== null) {
        if (seen.has(obj)) {
            // If we've seen this object before, don't process it again
            return;
        }
        seen.add(obj); // Mark this object as seen

        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = handleBigInts(value, seen); // Recursively process nested objects
        }
        return result;
    }
    return obj; // Return the value unchanged if it's neither an object nor a BigInt
}


function removeCircularReferences(obj: any, parent = null) {
    const seenObjects = new WeakMap();

    function detect(obj: any, parent: any) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.has(obj)) {
                return '[Circular]';
            }
            seenObjects.set(obj, true);

            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (parent === obj[key]) {
                        obj[key] = '[Circular]';
                    } else {
                        detect(obj[key], obj);
                    }
                }
            });
        }
    }

    detect(obj, parent);
    return obj;
}