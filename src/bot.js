import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./utils/db.js";
import Logger from "./utils/logger.js";
import Queue from "@kyvrixon/async-queue";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
	partials: Object.keys(Partials).map((x) => Partials[x]),
	intents: Object.keys(GatewayIntentBits).map((x) => GatewayIntentBits[x]),
});

const q = new Queue("Main", true);
client.queue = q;

/**
 * Initializes the bot, sets up the necessary files and modules, and logs the bot in.
 */
async function start() {
	Logger.info("Init", "Starting...");

	if (!fs.existsSync(path.join("metadata.json"))) {
		Logger.warn("init", "No metadata.json file detected!");
	}

	const data = await db.read("../metadata");

	if (data) {
		for (const fileName of data.filepaths) {
			if (!fs.existsSync(path.resolve(__dirname, "..", "db", fileName + ".json"))) {
				await db.write(fileName, {});
			}
		}
	}
	Logger.info("init", "Cache files written successfully");

	const moduleFiles = fs.readdirSync(path.join(__dirname, "modules"));
	for (const file of moduleFiles) {
		const filePath = path.join(__dirname, "modules", file);
		const fileStat = fs.statSync(filePath);
		if (
			fileStat.isDirectory() ||
			!file.endsWith(".js") ||
			path.basename(file).startsWith("_")
		) {
			continue;
		}
		const module = await import(`file://${filePath}`);
		module.default(client);
	}
	await client.login(process.env.BOT_TOKEN);
}

start();

export default client;

