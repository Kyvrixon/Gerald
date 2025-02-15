import { SlashCommandBuilder } from "discord.js";
import { handleCmd } from "../utils/functions.js";
import Logger from "../utils/logger.js";

export const command = {
	dev_only: false,
	enabled: true,

	data: new SlashCommandBuilder()
		.setName("afk")
		.setDescription("💤 Interact with the AFK system!")

		.addSubcommand((x) =>
			x
				.setName("set")
				.setDescription("💤 Set your AFK")
				.addStringOption((x) =>
					x
						.setName("message")
						.setDescription("what is your AFK message?")
				)
		)
		.addSubcommand((x) =>
			x
				.setName("list")
				.setDescription("💤 List the currently AFK users in the server")
				.addBooleanOption(x=>x
					.setName("private")
					.setDescription("Do you want to view this privately?")
				)
		),
	async init(client, interaction) {
		try {
			await handleCmd(client, interaction);
		} catch (err) {
			Logger.error("/afk", "idk sum went wrong", err);
		}
	},
};
export default command;
