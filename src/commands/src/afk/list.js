import afk from "../../../utils/afk.js";
import { createLeaderboard } from "../../../utils/functions.js";

export default async (client, interaction) => {
	const data = await afk.list();
	const newArray = [];
	const privateA = interaction.options.getBoolean("private");

	for (const afk of data) {
		const txt =
			`- <@${afk.user}>\n` +
			`  - **Message:** ${afk.message}\n` +
			`  - **Since:** <t:${afk.time}:R>`;

		newArray.push(txt);
	}

	await createLeaderboard("AFK Users", newArray, interaction, 3, null, privateA);
};
