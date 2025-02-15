import { ActivityType } from "discord.js";
import Logger from "../../utils/logger.js";

const event = {
	enabled: true,

	name: "ready",
	once: true,
	async init(client) {
		Logger.info("Bot", "Ready!");

		client.user.setPresence({
			activities: [
				{
					name: 'Watching over Tsukiyo',
					type: ActivityType.Custom
				}
			],
			status: 'dnd',
		})

	},
};
export default event;
