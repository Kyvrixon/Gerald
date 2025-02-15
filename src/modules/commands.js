import chalk from "chalk";
import { Collection, REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async (client) => {
	client.commands = new Collection();
	try {
		let count = 0;
		let errored = 0;
		let disabled = 0;
		const commands = [];
		const commandsPath = path.join(__dirname, "..", "commands");
		const readCommandFiles = (dirPath) => {
			return fs
				.readdirSync(dirPath)
				.filter((file) => {
					const filePath = path.join(dirPath, file);
					const stat = fs.statSync(filePath);
					return (
						stat.isFile() &&
						file.endsWith(".js") &&
						!file.startsWith("_")
					);
				})
				.map((file) => path.join(dirPath, file));
		};
		const commandFiles = readCommandFiles(commandsPath);
		for (const filePath of commandFiles) {
			try {
				const commandModule = await import("file://" + filePath);
				const command = commandModule.default;
				if (command.data) {
					client.commands.set(command.data.name, command);
					commands.push(command.data.toJSON());
					count++;
					if (
						typeof command.enabled === "boolean" &&
						command.enabled === false
					) {
						disabled++;
					}
					continue;
				} else {
					throw new Error("Command is not set up correctly");
				}
			} catch (error) {
				const location = filePath
					.replace(commandsPath, "")
					.replace(/\\/g, " > ")
					.replace(/^ > /, "");
				Logger.warn(
					"Cmd Loader",
					`"${location}" isn't setup correctly: ` + error.message
				);
				errored++;
			}
		}

		const rest = new REST({ version: "10" }).setToken(
			process.env.BOT_TOKEN
		);
		try {
			let registered = 0;
			if (!process.env.dev) {
				registered = await rest.put(
					Routes.applicationCommands(process.env.BOT_ID),
					{
						body: commands,
					}
				);
			} else if (process.env.dev && process.env.dev === "yes") {
				registered = await rest.put(
					Routes.applicationGuildCommands(
						process.env.BOT_ID,
						"1125196330646638592"
					),
					{ body: commands }
				);
			}
			Logger.info(
				"Cmd Loader",
				`Loaded ${chalk.green(count)}/${chalk.green(commandFiles.length)} (${chalk.hex("#FFA500")(disabled)} disabled | ${chalk.red(errored)} errored | ${chalk.hex("#FF00FF")(registered.length)} registered)`
			);
			return;
		} catch (error) {
			Logger.error(
				"Cmd Loader",
				"Failed to register: " + error.message,
				error
			);
			process.exit(1);
		}
	} catch (error) {
		Logger.error("Cmd Loader", error.message, error);
		process.exit(1);
	}
};
