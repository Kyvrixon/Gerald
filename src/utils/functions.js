import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelSelectMenuInteraction,
	Colors,
	CommandInteraction,
	ComponentType,
	ContextMenuCommandInteraction,
	EmbedBuilder,
	MentionableSelectMenuInteraction,
	MessageFlags,
	ModalBuilder,
	ModalSubmitInteraction,
	PermissionFlagsBits,
	PermissionsBitField,
	RoleSelectMenuInteraction,
	StringSelectMenuInteraction,
	TextInputBuilder,
	TextInputStyle,
	UserSelectMenuInteraction
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import client from "../bot.js";
import db from "./db.js";
import { errEmbed } from "./embeds.js";
import Logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Handles a command interaction.
 */
export const handleCmd = async (client, interaction, ...extras) => {
	const command = interaction.commandName;
	const subcommandGroup = interaction.options?.getSubcommandGroup() || null;
	const subcommand = interaction.options?.getSubcommand() || null;

	let filePath = path.resolve(__dirname, "..", "commands", "src", command);

	if (subcommandGroup) {
		filePath = path.join(filePath, subcommandGroup);
	};

	filePath = path.join(filePath, (subcommand || "") + ".js");

	if (!fs.existsSync(filePath)) {
		console.error(`[ERROR] Command file not found: ${filePath}`);
		return new Error("Path does not exist for interaction");
	}

	try {
		const cmd = await import("file://" + filePath);
		await cmd.default(client, interaction, ...extras);
		return true;
	} catch (err) {
		console.error(`[ERROR] Failed to execute command: ${filePath}`, err);
		return err;
	}
};


/**
 * Creates a paginated embed with navigation buttons.
 */
export const createLeaderboard = async (
	title,
	list,
	interaction,
	pageCount = 5,
	footerText,
	ephemeral = false
) => {
	if (!Array.isArray(list)) {
		return interaction.reply({
			embeds: [errEmbed("Invalid data", null, interaction, "An error occurred")],
			flags: ephemeral ? MessageFlags.Ephemeral : undefined
		});
	}

	if (list.length === 0) {
		return interaction.reply({
			embeds: [errEmbed("No data to be shown", null, interaction, "An error occurred")],
			flags: ephemeral ? MessageFlags.Ephemeral : undefined,
		});
	}

	const totalPages = Math.ceil(list.length / pageCount);
	const generateEmbed = async (start) => {
		return new EmbedBuilder()
			.setAuthor({ name: title })
			.setDescription(list.slice(start, start + pageCount).join("\n"))
			.setColor("DarkButNotBlack")
			.setFooter(footer(footerText));
	};

	const getPaginationRow = (currentIndex) => {
		return new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("back_button")
				.setLabel("Prev")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentIndex === 0),
			new ButtonBuilder()
				.setCustomId("page_info")
				.setLabel(`${Math.floor(currentIndex / pageCount) + 1}/${totalPages}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(totalPages === 1),
			new ButtonBuilder()
				.setCustomId("forward_button")
				.setLabel("Next")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentIndex + pageCount >= list.length)
		);
	};

	let currentIndex = 0;

	try {
		if (!interaction.replied && !interaction.deferred) {
			await interaction.deferReply({ flags: ephemeral ? MessageFlags.Ephemeral : undefined, withResponse: true });
		} else { };

		await interaction.editReply({
			embeds: [await generateEmbed(currentIndex)],
			components: [getPaginationRow(currentIndex)],
		});

	} catch (e) {
		return interaction.followUp({
			embeds: [errEmbed("Failed to generate pagination", e, interaction, "Error")],
			flags: ephemeral ? MessageFlags.Ephemeral : undefined
		});
	}

	const collector = interaction.channel.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60000,
	});

	collector.on("collect", async (btn) => {

		if (!["back_button", "page_info", "forward_button"].includes(btn.customId)) {
			return;
		}

		if (btn.user.id !== interaction.user.id) {
			return btn.reply({
				content: "This isn't for you.",
				flags: ephemeral ? MessageFlags.Ephemeral : undefined
			});
		}

		if (btn.customId === "page_info") {
			const modal = new ModalBuilder()
				.setCustomId("page_modal")
				.setTitle("Page Indexer")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("page_number")
							.setLabel("Enter page number")
							.setStyle(TextInputStyle.Short)
							.setRequired(true)
					)
				);

			await btn.showModal(modal);
			const modalSubmit = await btn.awaitModalSubmit({ time: 15000 }).catch(() => null);

			if (modalSubmit) {
				const pageNumber = parseInt(modalSubmit.fields.getTextInputValue("page_number"), 10);
				if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
					return modalSubmit.reply({
						content: "Invalid page number.",
						flags: ephemeral ? MessageFlags.Ephemeral : undefined
					});
				}

				currentIndex = (pageNumber - 1) * pageCount;

				await interaction.editReply({
					embeds: [await generateEmbed(currentIndex)],
					components: [getPaginationRow(currentIndex)],
				});

				await modalSubmit.deferUpdate();
			}
		} else {
			currentIndex += btn.customId === "back_button" ? -pageCount : pageCount;

			await Promise.all([
				interaction.editReply({
					embeds: [await generateEmbed(currentIndex)],
					components: [getPaginationRow(currentIndex)],
				}),
				btn.deferUpdate(),
			]);
		}

		collector.resetTimer();
	});

	collector.on("end", async () => {
		try {
			await interaction.editReply({
				components: [
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId("expired")
							.setLabel("Expired")
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
					),
				],
			});
		} catch (e) {
			Logger.error("adhad", "sum bad hap :(", e)
		}
	});
};
/**
 * Generated the embed footer with the provided text and icon.
 */
export const footer = (text, pic) => {
	return {
		text: `${text || ""}\n© Kyvrixon 2025`,
		icon_url: pic || undefined,
	};
};

/**
 * The thin bar image, returns the url.
 */
export const img = () => {
	return "https://cdn.discordapp.com/attachments/1125196334316650652/1337363252182650894/very_thin_bar.png?ex=67ae6c56&is=67ad1ad6&hm=734676e58e2e73c6a55a5aabc7c63f01fed230939766a2c7f5086c961cfc5d7d&";
};

/**
 * Check if a user is a developer
 */
export const devCheck = async (userId) => {
	if (userId === "981755777754755122") {
		return true;
	}
	try {
		const data = await db.read("metadata");
		const devsList = data?.devs;
		return devsList.includes(userId);
	} catch {
		return false;
	}
};
/**
 * Get an invite for the provided guild
 */
export const getInvite = async (guild, channel) => {
	try {
		let invite = null;
		let invites;
		try {
			invites = await guild.invites.fetch();
		} catch (fetchError) {
			Logger.error(
				"function getInvite",
				`Error fetching invites for server: ${guild.name} | ${guild.id}`,
				fetchError
			);
		}
		if (invites.size > 0) {
			invite =
				invites.find(
					(invite) =>
						invite.inviter?.id === client?.user?.id &&
						!invite.expiresAt
				) || invites.find((invite) => !invite.expiresAt);
			if (invite) {
				return invite.url;
			}
		}
		if (!invite && channel) {
			try {
				invite = await guild.invites.create(channel.id, { maxAge: 0 });
			} catch (createError) {
				Logger.error(
					"function getInvite",
					`Error creating invite for channel: ${channel.id} in guild: ${guild.name} | ${guild.id}`,
					createError
				);
			}
		}
		if (!invite && !channel) {
			const targetChannel =
				guild.systemChannel ||
				guild.channels.cache.find(
					(ch) =>
						ch.isTextBased() &&
						ch
							.permissionsFor(
								guild.members.cache.get(client?.user?.id)
							)
							.has(PermissionFlagsBits.CreateInstantInvite)
				);
			if (targetChannel) {
				try {
					invite = await targetChannel.createInvite({
						maxAge: 0,
					});
				} catch (createError) {
					Logger.error(
						"function getInvite",
						`Error creating invite for channel: ${targetChannel.id} in guild: ${guild.name} | ${guild.id}`,
						createError
					);
				}
			} else {
				Logger.error(
					"function getInvite",
					`No suitable channel found for creating invite in guild: ${guild.name} | ${guild.id}`,
					null
				);
			}
		}
		return invite ? invite.url : null;
	} catch (error) {
		Logger.error(
			"function getInvite",
			`Unexpected error while processing invites for server: ${guild.name} | ${guild.id}`,
			error
		);
		return null;
	}
};
/**
 * Makeshift delay system
 *
 * @param {Number} time
 * @returns {Promise<void>} Promise
 */
export const delay = async (time) => {
	const t = time * 1000;
	return new Promise((resolve) => setTimeout(resolve, t));
};
/**
 * Checks if the bot and/or user have the required permissions in a specified location.
 *
 * @param {{
 *   bot: string[] | null,
 *   user: string[] | null,
 *   source: Message | Interaction,
 *   target: "both" | "user" | "bot",
 *   where: "here" | string
 * }} options - Permission check options.
 * @returns {Promise<boolean>} Whether the required permissions are met.
 *
 * @example
 * const hasPerms = await checkPermissions({
 *   bot: ["SendMessages"],
 *   user: ["BanMembers"],
 *   source: interaction,
 *   target: "both",
 *   where: "here"
 * });
 * if (!hasPerms) return interaction.reply("Missing permissions!");
 */
export const checkPermissions = async (options) => {
	if (!options) {
		throw new Error("Missing options object");
	}

	const { bot, user, source, target, where } = options;
	const requiredParams = { bot, user, source, target, where };

	// Ensure no parameters are missing
	for (const [key, value] of Object.entries(requiredParams)) {
		if (value === undefined) {
			throw new Error(`Missing required parameter: ${key}`);
		}
	}

	const guild = source.guild;
	if (!guild) {
		throw new Error("Source must be from a guild");
	}

	// Resolve target channel
	let channel;
	if (where === "here") {
		channel = source.channel;
	} else {
		channel = await guild.channels.fetch(where).catch(() => null);
		if (!channel) {
			throw new Error(
				"Channel not found for the provided 'where' parameter"
			);
		}
	}

	// If bot & user permissions are both null or empty, return true
	if ((!bot || bot.length === 0) && (!user || user.length === 0)) {
		return true;
	}

	const getMember = (id) => guild.members.cache.get(id);
	const getPermissionChecker = (memberId) => {
		const member = getMember(memberId);
		return (perm) => {
			const bitField = PermissionsBitField.Flags[perm];
			if (!bitField) {
				return false;
			} // If permission doesn't exist, treat as untruthy

			// If permission is not channel-based, check guild-wide permissions
			const isChannelBased = channel
				?.permissionsFor(member)
				.has(bitField);
			return isChannelBased ?? member?.permissions.has(bitField);
		};
	};

	const checkPermissions = (permissions, memberId) =>
		permissions.every(getPermissionChecker(memberId));

	// Apply target-based checks
	if (target === "both") {
		return (
			checkPermissions(bot, guild.members.me.id) &&
			checkPermissions(user, source.user.id)
		);
	}
	if (target === "user") {
		return checkPermissions(user, source.user.id);
	}
	if (target === "bot") {
		return checkPermissions(bot, guild.members.me.id);
	}

	return false;
};

/**
 * Checks if a colour is valid to use in embeds.
 */
export const isValidColour = (input) => {
	if (Object.keys(Colors).includes(input)) {
		return true;
	}
	if (isHex(input)) {
		return true;
	}
	if (is0x(input)) {
		return true;
	}
	return false;
	function isHex(input) {
		return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(input);
	}
	function is0x(input) {
		return /^0x[A-Fa-f0-9]{6}$/.test(input);
	}
};
/**
 * Get the emoji mention string by name.
 */
export const getEmoji = (client, name) => {
	const emoji = client.emoji?.get(name);
	if (!emoji) {
		return null;
	}
	if (emoji.animated) {
		return `<a:${emoji.name}:${emoji.id}>`;
	} else {
		return `<:${emoji.name}:${emoji.id}>`;
	}
};
/**
 * Get an emoji URL by its name.
 */
export const getEmojiUrl = (client, name) => {
	const emoji = client.emoji?.get(name);
	if (!emoji || !emoji.id) {
		return null;
	}
	if (emoji.animated) {
		return `https://cdn.discordapp.com/emojis/${emoji.id}.gif?quality=lossless&size=4096`;
	} else {
		return `https://cdn.discordapp.com/emojis/${emoji.id}.png?quality=lossless&size=4096`;
	}
};
/**
 * Convert a new Date() to discord timestamp format.
 *
 * @param {Number} date
 * @returns {String} your unix timestamp
 */
export const convertToUnix = (date) => {
	return Math.floor(date / 1000);
};
/**
 * Generate a random generated ID.
 *
 * @param {number} length
 * @returns {string}
 */
export const generateId = (length) => {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
};
export const getCmdPath = (source) => {
	if (!source || !source.commandName) {
		return;
	}
	let cmdValueString = "";
	if (source instanceof CommandInteraction) {
		const group = source.options.getSubcommandGroup(false);
		const sub = source.options.getSubcommand(false);
		const commandInfo = {
			subcommandGroup: group,
			subcommand: sub,
		};
		cmdValueString = `> \`/${source.commandName} ${commandInfo.subcommandGroup ? `${commandInfo.subcommandGroup} ` : ""}${commandInfo.subcommand || ""}\``;
	} else if (source instanceof ContextMenuCommandInteraction) {
		cmdValueString = `> \`/${source.commandName}\``;
	} else if (source instanceof ModalSubmitInteraction) {
		cmdValueString = `> \`Modal: ${source.customId}\``;
	} else if (
		source instanceof StringSelectMenuInteraction ||
		source instanceof UserSelectMenuInteraction ||
		source instanceof RoleSelectMenuInteraction ||
		source instanceof MentionableSelectMenuInteraction ||
		source instanceof ChannelSelectMenuInteraction
	) {
		cmdValueString = `> \`Select Menu: ${source.customId}\``;
	} else if (source instanceof ButtonInteraction) {
		cmdValueString = `> \`Button: ${source.customId}\``;
	} else {
		cmdValueString = "> `Unknown Interaction Type`";
	}
	return cmdValueString;
};
/**
 * Generates a random hex colour code.
 *
 * @returns {string} A hex colour code (e.g. `#FF0000`).
 */
export const genColour = () => {
	const hexChars = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += hexChars[Math.floor(Math.random() * 16)];
	}
	return color;
};

/**
 * Censors a message by replacing certain words and patterns with a replacement string.
 *
 * @param {string} msg - The message to censor.
 * @param {Array<string>} arr - An array of words to censor.
 * @param {string} rep - The replacement string.
 * @param {...RegExp} patterns - Regex patterns to censor.
 */
function censorText(msg, arr, rep, ...patterns) {
	arr.forEach(word => {
		const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
		msg = msg.replace(wordRegex, rep);
	});

	patterns.forEach(regex => {
		msg = msg.replace(regex, rep);
	});

	return message;
};

//===================
export default {
	handleCmd,
	createLeaderboard,
	footer,
	devCheck,
	getInvite,
	delay,
	checkPermissions,
	isValidColour,
	getEmoji,
	getEmojiUrl,
	convertToUnix,
	generateId,
	genColour,
	img,
	getCmdPath,
	censorText
};
