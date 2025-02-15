import { EmbedBuilder } from "discord.js";
import { footer } from "./functions.js";
/**
 * Creates an error embed message.
 */
export const errEmbed = (message, error, source, title) => {
	// const characters =
	// 	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	// let code = "";
	// for (let i = 0; i < 10; i++) {
	// 	code += characters.charAt(
	// 		Math.floor(Math.random() * characters.length)
	// 	);
	// }
	const embedReply = new EmbedBuilder()
		.setColor(error ? "Red" : "Orange")
		.setTitle(title)
		.setDescription(`> ${message}`)
		.setImage(
			"https://cdn.discordapp.com/attachments/1125196334316650652/1337363252182650894/very_thin_bar.png?ex=67ae6c56&is=67ad1ad6&hm=734676e58e2e73c6a55a5aabc7c63f01fed230939766a2c7f5086c961cfc5d7d&"
		)
		.setFooter(footer());

	// if (error && source) {
	//     embedReply
	//         .setDescription(`\`\`\`\n${message}\`\`\``)
	//         .setAuthor({ name: `Error ID: ${code}` })
	//         .addFields({
	//         name: "__Error Help__",
	//         value: "> If the error affects functionality, join our support server, open a ticket, and share the **Error ID**. A dev may join to investigate, please grant necessary permissions they request. Use `/auth-check` to verify their identity first.",
	//         inline: false,
	//     })
	//         .setFooter(footer(null, undefined));
	//     //sendLog(error, source);
	// }
	return embedReply;
	/**
	 * Sends the error log to a specified channel.
	 */
	// async function sendLog(error, source) {
	//     let cmdValueString = "";
	//     source.channel;
	//     if (source instanceof ChatInputCommandInteraction) {
	//         let group;
	//         let sub;
	//         try {
	//             group = source.options.getSubcommandGroup();
	//         }
	//         catch {
	//             group = null;
	//         }
	//         try {
	//             sub = source.options.getSubcommand();
	//         }
	//         catch {
	//             sub = null;
	//         }
	//         const commandInfo = {
	//             subcommandGroup: group,
	//             subcommand: sub,
	//         };
	//         cmdValueString = `> \`/${source.commandName} ${commandInfo.subcommandGroup ? `${commandInfo.subcommandGroup} ` : ""}${commandInfo.subcommand || ""}\``;
	//     }
	//     else if (source instanceof ContextMenuCommandInteraction) {
	//         cmdValueString = `> \`/${source.commandName}\``;
	//     }
	//     else if (source instanceof ModalSubmitInteraction) {
	//         cmdValueString = `> \`Modal: ${source.customId}\``;
	//     }
	//     else if (source instanceof StringSelectMenuInteraction ||
	//         source instanceof UserSelectMenuInteraction ||
	//         source instanceof RoleSelectMenuInteraction ||
	//         source instanceof MentionableSelectMenuInteraction ||
	//         source instanceof ChannelSelectMenuInteraction) {
	//         cmdValueString = `> \`Select Menu: ${source.customId}\``;
	//     }
	//     else if (source instanceof ButtonInteraction) {
	//         cmdValueString = `> \`Button: ${source.customId}\``;
	//     }
	//     else {
	//         cmdValueString = "> `Unknown Interaction Type`";
	//     }
	//     const embedLog = new EmbedBuilder()
	//         .setTitle("An error occurred")
	//         .setDescription(`__**Error Message:**__ \`\`\`\n${error?.message}\`\`\`\n__**Stack Trace:**__ \`\`\`\n${error?.stack}\`\`\``)
	//         .addFields({
	//         name: "__Error Code__",
	//         value: `> \`${code}\``,
	//         inline: true,
	//     }, {
	//         name: "__Server__",
	//         value: `> \`${source?.guild?.name}\``,
	//         inline: true,
	//     }, {
	//         name: "__User__",
	//         value: `> \`${source instanceof Message ? source?.author?.username : source?.user?.username}\``,
	//         inline: true,
	//     }, {
	//         name: "__Channel__",
	//         value: `> \`${source.channel.name || "Cannot find channel"}\`\n> <#${source?.channel?.id}>`,
	//         inline: true,
	//     }, {
	//         name: "__Timestamp__",
	//         value: `> <t:${Math.floor(new Date().getTime() / 1000)}:f>`,
	//         inline: true,
	//     }, {
	//         name: "__Command/Interaction__",
	//         value: cmdValueString,
	//         inline: true,
	//     });
	//     const inviteLink = (await getInvite(source.guild, source.channel)) || "";
	//     const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
	//         .setStyle(ButtonStyle.Link)
	//         .setURL(inviteLink)
	//         .setDisabled(inviteLink ? false : true)
	//         .setLabel(inviteLink ? "Join the server" : "No invite available"));
	//     const logChannel = await client.channels.fetch("1322722379113300018");
	//     try {
	//         await logChannel?.send({
	//             embeds: [embedLog],
	//             components: [row],
	//         });
	//     }
	//     catch (err) {
	//         err;
	//         Logger.error("function errEmbed", "Failed to log an error: " + err.message, err);
	//         return;
	//     }
	// }
};
/**
 * Creates a basic embed
 */
export const basicEmbed = (
	title,
	description, // this field is required
	fields,
	colour,
	author,
	footerText,
	timestamp,
	thumbnail,
	image
) => {
	const embed = new EmbedBuilder();
	if (title) {
		embed.setTitle(title);
	}
	embed.setDescription(description);
	if (footerText) {
		embed.setFooter(footer());
	}
	if (Array.isArray(fields) && fields.length > 0) {
		embed.addFields(fields);
	}
	embed.setColor(colour);
	if (timestamp) {
		embed.setTimestamp();
	}
	if (thumbnail) {
		embed.setThumbnail(thumbnail);
	}
	if (image) {
		embed.setImage(image);
	}
	if (author) {
		embed.setAuthor(author);
	}
	return embed;
};
