import db from "../db.js";

let messageCounter = 0; // Global counter
const MSG_CAP = 20;

/**
 * Sends a random message.
 * @param {import('discord.js').Client} client - The Discord client instance.
 * @param {import('discord.js').Message} message - The message object.
 * @param {boolean} mentioned - Whether the message was a mention.
 * @returns {Promise<void>}
 */
export const randomMsg = async (client, message, mentioned) => {
    if (message.channel.id !== "1295176139639230496") return;
    if (message.author.bot) return;

    messageCounter++;

    if (mentioned || messageCounter >= MSG_CAP) {
        if (!mentioned) {
            messageCounter = 0;
        }
        await sendMessage(client, message, mentioned);
    }
};

/**
 * Sends a random message.
 * @param {import('discord.js').Client} client - The Discord client instance.
 * @param {import('discord.js').Message} message - The message object.
 * @param {boolean} mentioned - Whether the message was a mention.
 * @returns {Promise<void>}
 */
const sendMessage = async (client, message, mentioned) => {
    await client.queue.add("random-msg-update", async () => {
        const x = await db.read("cache/messages");
        return x;
    });

    await client.queue.start();
    const data = await client.queue.getResult("random-msg-update");

    const channelMessages = data.msgs?.["1295176139639230496"] || [];
    if (channelMessages.length < 50 && !mentioned) return;

    const numMessages = Math.floor(Math.random() * 4) + 1;
    const selectedMessages = [];

    for (let i = 0; i < numMessages; i++) {
        const randomIndex = Math.floor(Math.random() * channelMessages.length);
        selectedMessages.push(channelMessages[randomIndex]?.content || "");
    }

    const cleanedMessages = (await Promise.all(selectedMessages.map(cleanMessage))).filter(msg => msg.trim());

    if (!cleanedMessages.length) return;

    const shouldSplit = Math.random() > 0.5;

    let combinedMsg;
    if (shouldSplit) {
        const splitMessages = cleanedMessages.map(msg => {
            const words = msg.split(" ");
            const numSplits = Math.min(words.length, Math.floor(Math.random() * 3) + 1);
            const splitLength = Math.ceil(words.length / numSplits);

            return Array.from({ length: numSplits }, (_, i) =>
                words.slice(i * splitLength, (i + 1) * splitLength).join(" ")
            );
        });

        const mixedParts = splitMessages.map(parts => parts[Math.floor(Math.random() * parts.length)]);
        combinedMsg = mixedParts.join(" ");
    } else {
        combinedMsg = cleanedMessages.join(" ").replace(/\n/g, "").toLowerCase();
    }

    if (combinedMsg.trim()) {
        const payload = { content: combinedMsg, allowedMentions: { parse: [] } };
        mentioned ? await message.reply(payload) : await message.channel.send(payload);
    }
};

const cleanMessage = async (msg) => msg.trim();

export default randomMsg;
