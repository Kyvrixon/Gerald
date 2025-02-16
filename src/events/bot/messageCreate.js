import db from "../../utils/db.js";
import afkHandler from "../../utils/handlers/afkHandler.js";
import Logger from "../../utils/logger.js";
import randomMsg from "../../utils/handlers/randomMsg.js";

const MAX_CACHE_SIZE = 300;

const event = {
	enabled: true,
	name: "messageCreate",
	once: false,

	async init(client, message) {

		let botMentioned = false;

		if (
			message.author.id !== client.user.id && // Ignore the bot's own messages
			(
				message.content.includes("<@1339396989585985627>") ||
				message.mentions.has(client.user) ||
				(message?.reference && message?.reference?.messageId && message?.channel?.messages?.cache?.get(message?.reference?.messageId)?.author?.id === client?.user?.id)
			)
		) {
			botMentioned = true;
		}

		try {
			afkHandler(message);
			cacheMessage(message);
			randomMsg(message, botMentioned);
		} catch (err) {
			Logger.error("msgCreate", "sum broke :(", err);
		}
	},
};

export default event;

async function cacheMessage(message) {
	if (!message || message.author.bot || !message.content) {
		return;
	}

	try {
		const cacheData = {
			author: message.author.id,
			msg_id: message.id,
			content: message.content,
			cached_at: Date.now(),
		};

		const data = await db.read("cache/messages");

		if (!data.msgs) {
			data.msgs = {};
		}
		if (!Array.isArray(data.msgs[message.channel.id])) {
			data.msgs[message.channel.id] = [];
		}

		data.msgs[message.channel.id].push(cacheData);

		if (data.msgs[message.channel.id].length > MAX_CACHE_SIZE) {
			data.msgs[message.channel.id].shift();
		}


		await db.write("cache/messages", data);

	} catch (err) {
		Logger.error("cacheMessage", "Error caching message", err);
	}
}
