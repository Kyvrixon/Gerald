import afk from "../afk.js";
import { basicEmbed } from "../embeds.js";

export const afkHandler = async (message) => {
	const AFK = afk;
	if (message.author.bot) {
		return;
	}

	// Check if the author is AFK
	const isInAfk = await AFK.check(message.author);
	if (
		isInAfk?.message &&
		isInAfk?.time &&
		!message.content.toLowerCase().startsWith("[afk]")
	) {
		try {
			const msg = await message.channel.send({
				embeds: [
					basicEmbed(
						null,
						`You went AFK <t:${isInAfk.time}:R> with reason: \`${isInAfk.message}\``,
						[],
						"Green",
						{
							name: `Welcome back, ${message.author.username}!`,
							iconURL: message.author.displayAvatarURL(),
						},
						"This message will auto-delete in 15s"
					),
				],
			});

			setTimeout(async () => {
				try {
					await msg.delete();
				} catch {}
			}, 15000);
		} catch {
			// Suppress errors
		}

		await AFK.clear(message.author);
	}

	// Mentioned users AFK check (ignoring @everyone and @here)
	if (
		message.mentions.users.size > 0 &&
		!message.content.includes("@here") &&
		!message.content.includes("@everyone")
	) {
		message.mentions.users.map(async (u) => {
			if (u.id === message.author.id) {
				return;
			}

			const isAFK = await AFK.check(u);
			if (!isAFK?.message) {
				return;
			}

			try {
				const msg = await message.channel.send({
					embeds: [
						basicEmbed(
							null,
							`**Reason:** ${isAFK.message}\n**Since:** <t:${Math.floor(parseInt(isAFK.time) / 1000)}:R>`,
							[],
							"DarkButNotBlack",
							{
								name: `${u.username} is currently AFK!`,
								iconURL: u.displayAvatarURL(),
							},
							"This message will auto-delete in 15 seconds"
						),
					],
				});

				setTimeout(async () => {
					try {
						await msg.delete();
					} catch {}
				}, 15000);
			} catch {
				// Suppress errors
			}
		});
	}
};

export default afkHandler;
