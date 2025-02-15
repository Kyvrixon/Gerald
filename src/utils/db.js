import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database handler for managing JSON files.
 */
class db {
	/**
	 * Reads the contents of a JSON file.
	 * @param {string} filename - Path to the JSON file inside the db folder.
	 * @returns {Promise<Object>} - The contents of the JSON file.
	 */
	static async read(filename) {
		filename = filename.replace(".json", "");
		const filePath = path.join(__dirname, "../../db", filename + ".json"); // Path to db folder at project root

		try {
			if (!fs.existsSync(filePath)) {
				await fs.promises.mkdir(path.dirname(filePath), {
					recursive: true,
				});
				await fs.promises.writeFile(
					filePath,
					JSON.stringify({}, null, 2),
					"utf8"
				); // this line errors
			}

			const data = await fs.promises.readFile(filePath, "utf8");
			return JSON.parse(data);
		} catch (error) {
			Logger.error("db", `Error reading file ${filename}:`, error);
			return {};
		}
	}

	/**
	 * Writes data to a JSON file. If the file doesn't exist, it will be created. Use "../../" at the start of the file name for project root.
	 * @param {string} filename - Path to the JSON file inside the db folder.
	 * @param {Object} data - The data to write to the file.
	 * @returns {Promise<boolean>} - Resolves when the file is successfully written.
	 */
	static async write(filename, data) {
		await client.queue.add("db-write", async () => {
			try {
				filename = filename.replace(".json", "");
				const filePath = path.join(__dirname, "../../db", filename + ".json"); // Path to db folder at project root

				if (typeof data === "string") {
					try {
						data = JSON.parse(data);
					} catch (error) {
						console.error(
							`Invalid JSON string for ${filename}:`,
							error
						);
						return false;
					}
				} else if (typeof data !== "object" || data === null) {
					console.error(
						`Invalid data for ${filename}: must be an object or JSON string.`
					);
					return false;
				}

				const dirPath = path.dirname(filePath);
				if (!fs.existsSync(dirPath)) {
					await fs.promises.mkdir(dirPath, { recursive: true });
				}

				await fs.promises.writeFile(
					filePath,
					JSON.stringify(data, null, 2),
					"utf8"
				);
				return true;
			} catch (error) {
				console.error(`Error writing to file ${filename}:`, error);
				return false;
			}
		});

		const result = await client.queue.getResult("db-write");
		return result;
	}

	/**
	 * Deletes a key from a JSON file (can be a nested key).
	 * @param {string} filename - Path to the JSON file inside the db folder.
	 * @param {string} key - The key to delete (can use dot notation for nested keys).
	 * @returns {Promise<Object>} - Resolves when the key is deleted.
	 */
	static async delete(filename, key) {
		try {
			filename = filename.replace(".json", "");
			const data = await db.read(filename + ".json");
			const keys = key.split(".");
			let current = data;

			for (let i = 0; i < keys.length - 1; i++) {
				if (current[keys[i]] === undefined) {
					console.error(`Key ${key} not found in file ${filename}.`);
					return {};
				}
				current = current[keys[i]];
			}

			const finalKey = keys[keys.length - 1];
			if (current[finalKey] !== undefined) {
				const value = current[finalKey];

				if (Array.isArray(value)) {
					current[finalKey] = [];
				} else if (typeof value === "object" && value !== null) {
					current[finalKey] = {};
				} else if (typeof value === "string") {
					current[finalKey] = "";
				} else if (typeof value === "number") {
					current[finalKey] = 0;
				} else if (typeof value === "boolean") {
					current[finalKey] = false;
				} else if (value === null) {
					current[finalKey] = null;
				} else {
					current[finalKey] = "";
				}

				await db.write(filename, data);
				return {};
			} else {
				console.error(`Key ${key} not found in file ${filename}.`);
				return {};
			}
		} catch (error) {
			console.error(
				`Error deleting key ${key} from file ${filename}:`,
				error
			);
			return {};
		}
	}

	static async readAll(folderPath) {
		const dirPath = path.join(__dirname, "../../db", folderPath);
		const result = {};

		try {
			const files = await fs.promises.readdir(dirPath);
			const jsonFiles = files.filter((file) => file.endsWith(".json"));

			for (const file of jsonFiles) {
				const filePath = path.join(dirPath, file);
				const data = await fs.promises.readFile(filePath, "utf8");
				result[path.basename(file, ".json")] = JSON.parse(data);
			}
		} catch (error) {
			console.error(
				`Error reading all JSON files from ${folderPath}:`,
				error
			);
		}

		return result;
	}
}

export default db;
