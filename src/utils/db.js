import { promises as fs } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setIntervalAsync } from "set-interval-async/dynamic";
import Logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
  constructor() {
    this.locks = new Map();
  }

  _getFilePath(filename) {
    filename = filename.replace(".json", "");
    if (filename.startsWith("<root>/")) {
      return path.resolve(__dirname, "..", "..", filename.slice(7) + ".json");
    } else {
      return path.resolve(__dirname, "..", "..", "db", filename + ".json");
    }
  }

  async read(filename) {
    const filePath = this._getFilePath(filename);

    try {
      if (!await this.#fileExists(filePath)) {
        await this.write(filePath, {});
        return {};
      }

      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      Logger.error("db", `Error reading file ${filename}:`, error);
      return {};
    }
  }

  async write(filename, data) {
    const filePath = this._getFilePath(filename);

    try {
      await this.#_lockFile(filePath);

      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (parseError) {
          Logger.error(`Error parsing data for ${filename}:`, parseError);
          await this.#_unlockFile(filePath);
          return false;
        }
      } else if (typeof data !== "object" || data === null || Array.isArray(data)) {
        Logger.error(`Invalid data for ${filename}: must be an object.`);
        await this.#_unlockFile(filePath);
        return false;
      }

      if (!(await this.#fileExists(filePath))) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
      await this.#_unlockFile(filePath);
      return true;
    } catch (error) {
      Logger.error(`Error writing to file ${filename}:`, error);
      await this.#_unlockFile(filePath);
      return false;
    }
  }

  async delete(filename, key) {
    const filePath = this._getFilePath(filename);

    try {
      await this.#_lockFile(filePath);

      let existingData = {};
      if (await this.#fileExists(filePath)) {
        const rawData = await fs.readFile(filePath, "utf8");
        existingData = JSON.parse(rawData);
      }

      const keys = key.split(".");
      let current = existingData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
          Logger.error(`Key ${key} not found in file ${filename}.`);
          await this.#_unlockFile(filePath);
          return false;
        }
        current = current[keys[i]];
      }

      const finalKey = keys[keys.length - 1];
      if (current[finalKey] !== undefined) {
        delete current[finalKey];
      } else {
        Logger.error(`Key ${key} not found in file ${filename}.`);
        await this.#_unlockFile(filePath);
        return false;
      }

      await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), "utf8");
      await this.#_unlockFile(filePath);
      return true;
    } catch (error) {
      Logger.error(`Error deleting key ${key} from file ${filename}:`, error);
      await this.#_unlockFile(filePath);
      return false;
    }
  }

  async #readAll(filename) {
    const filePath = this._getFilePath(filename);

    //const 
  }

  async #_lockFile(filePath) {
    if (this.locks.get(filePath)) {
      await this.#_waitForFile(filePath);
    }
    this.locks.set(filePath, true);
  }

  async #_unlockFile(filePath) {
    this.locks.set(filePath, false);
  }

  async #_waitForFile(filePath) {
    return new Promise((resolve) => {
      const interval = setIntervalAsync(async () => {
        if (!this.locks.get(filePath)) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  }

  // Helper method to check if a file exists
  async #fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

const db = new Database();
export default db;
