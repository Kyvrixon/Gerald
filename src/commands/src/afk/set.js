import { MessageFlags } from "discord.js";
import afk from "../../../utils/afk.js";
import { basicEmbed } from "../../../utils/embeds.js";
import { img } from "../../../utils/functions.js";

export default async (client, interaction) => {
	const message = interaction.options.getString("message") || "Busy";

	await afk.set(interaction.user, Date.now(), message);

	return interaction.reply({
		embeds: [
			basicEmbed(
				"AFK Set!",
				"> AFK set successfully with message `" + message + "`",
				[],
				"Green",
				null,
				"put [afk] at the start of your message to keep talking and retain your afk status!",
				null,
				null,
				img()
			),
		],
		flags: MessageFlags.Ephemeral,
	});
};
