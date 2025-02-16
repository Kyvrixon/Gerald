import { Client, GatewayIntentBits, Partials } from "discord.js";

import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./utils/db.js";
import Logger from "./utils/logger.js";
import q from "./utils/queue.js";

configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
	partials: Object.keys(Partials).map(x => Partials[x]),
	intents: Object.keys(GatewayIntentBits).map(x => GatewayIntentBits[x]),
});

(async () => {

	await q.add("db-init", async () => {
		if (!fs.existsSync(path.join("db"))) {
			await fs.promises.mkdir(path.join("db"));
			return "db init ignore";
		} else {
			return "db init ignore";
		}
	});

	if (!fs.existsSync(path.join("metadata.json"))) {
		Logger.warn("init", "No metadata.json file detected!");
	} else {
		const data = await db.read("<root>/metadata");
		if (data) {
			console.log(data);
			for (const fileName of data.filepaths) {
				if (!fs.existsSync(path.resolve(__dirname, "..", "db", fileName + ".json"))) {
					await db.write(fileName, {});
				}
			}
			Logger.info("init", "Cache files written successfully");
		}
	}

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
})();

export default client;

