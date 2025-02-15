import { errEmbed } from "../../utils/embeds.js";
import { MessageFlags } from "discord.js";
import Logger from "../../utils/logger.js";
import { devCheck } from "../../utils/functions.js";

const interactionCreate = {
	name: "interactionCreate",
	once: false,
	enabled: true,
	async init(client, interaction) {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const command = client.commands.get(interaction.commandName);
		if (!command) {
			return;
		}

		if (
			(command.dev_only && !(await devCheck(interaction.user.id))) ||
			!command.enabled
		) {
			return interaction.reply({
				embeds: [
					errEmbed(
						"> You are not allowed to use this!",
						null,
						null,
						"Error"
					),
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			if (command.init) {
				await command.init(client, interaction);
			} else {
				Logger.error("int.Create", "init isnt a method", null);
			}
		} catch (err) {
			Logger.error("int. Create", "sum went wrong", err);
			interaction.reply({
				embeds: [
					errEmbed(
						"Error: " + err.message,
						err,
						interaction,
						"Failed"
					),
				],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};

export default interactionCreate;
