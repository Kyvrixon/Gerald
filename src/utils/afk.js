import db from "./db.js";

class afk {
	/**
	 * Check the AFK status for a user.
	 * @param {Object} user - The user object.
	 * @returns {Promise<Object|false>} AFK data for the user or `null` if not in AFK.
	 */
	static async check(user) {
		const data = await db.read("users/" + user.id);
		if (!data?.afk?.message || !data?.afk?.time) {
			return false;
		}
		return data.afk;
	}

	/**
	 * Set the AFK status for a user.
	 * @param {Object} user - The user object.
	 * @param {string} time - The AFK timestamp.
	 * @param {string} msg - The AFK message.
	 * @returns {Promise<boolean|Error>} `true` if successful, otherwise an `Error`.
	 */
	static async set(user, time, msg) {
		try {
			const data = await db.read("users/" + user.id);
			data.afk = { message: msg, time: Math.floor(time / 1000) };
			await db.write("users/" + user.id, data);
			return true;
		} catch (e) {
			return e;
		}
	}

	/**
	 * Clear the AFK status for a user.
	 * @param {Object} user - The user object.
	 * @returns {Promise<boolean|Error>} `true` if successful, otherwise an `Error`.
	 */
	static async clear(user) {
		try {
			await db.delete("users/" + user.id, "afk");
			return true;
		} catch (e) {
			return e;
		}
	}

	/**
	 * List the currently AFK users.
	 * @returns {Promise<Array>} An array of users and their AFK data.
	 */
	static async list() {
		const afkUserArray = [];
		const data = await db.readAll("users");

		for (const user in data) {
			if (data[user]?.afk?.message && data[user]?.afk?.time) {
				afkUserArray.push({
					user: user,
					message: data[user].afk.message,
					time: data[user].afk.time,
				});
			}
		}
		return afkUserArray;
	}
}

export default afk;
