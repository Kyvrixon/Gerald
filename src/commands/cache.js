import { SlashCommandBuilder } from "discord.js";
import { handleCmd } from "../utils/functions.js";
import Logger from "../utils/logger.js";

export const command = {
	dev_only: true,
	enabled: true,

	data: new SlashCommandBuilder()
		.setName("cache")
		.setDescription("🗃️ Cache System")

        .addSubcommand(x => x
            .setName("refresh")
            .setDescription("🗃️ Clear and refresh bot cache")
        )

    ,
	async init(client, interaction) {
		try {
			await handleCmd(client, interaction);
		} catch (err) {
			Logger.error("/cache refresh", "idk sum went wrong", err);
		}
	},
};
export default command;
