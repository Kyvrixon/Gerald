import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import Logger from "../utils/logger.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const readEventFiles = (dirPath) => {
	let result = [];
	fs.readdirSync(dirPath).forEach((file) => {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			result = result.concat(readEventFiles(filePath));
		} else {
			result.push(filePath);
		}
	});
	return result;
};
export default async (client) => {
	try {
		let count = 0;
		let disabled = 0;
		let errored = 0;
		const eventsPath = path.join(__dirname, "../events");
		const eventFiles = readEventFiles(eventsPath);
		for (const filePath of eventFiles) {
			try {
				const eventModule = await import(pathToFileURL(filePath).href);
				const event = eventModule.default;
				if (!event || !event.name || !event.init) {
					const location = filePath
						.replace(eventsPath, "")
						.replace(/\\/g, " > ")
						.replace(/^ > /, "");
					Logger.warn(
						"Event Loader",
						chalk.red(`"${location}" isn't setup correctly`)
					);
					errored++;
					continue;
				}
				count++;
				if (event?.enabled === true) {
					if (event.once) {
						client.once(event.name, (...args) =>
							event.init(client, ...args)
						);
					} else {
						client.on(event.name, (...args) =>
							event.init(client, ...args)
						);
					}
				} else {
					disabled++;
					continue;
				}
			} catch (error) {
				Logger.error(
					"Event Loader",
					chalk.red(`Error: ${error.message}`),
					error
				);
				errored++;
			}
		}
		Logger.info(
			"Event Loader",
			`Loaded ${chalk.green(count.toString())}/${chalk.green(eventFiles.length.toString())} (${chalk.hex("#FFA500")(disabled.toString())} disabled | ${chalk.red(errored.toString())} errored)`
		);
	} catch (e) {
		Logger.error(
			"Event Loader",
			"An error occurred while loading events",
			e
		);
		process.exit(1);
	}
};
