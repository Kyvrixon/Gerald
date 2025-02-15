import chalk from "chalk";

class Logger {
	/**
	 * Logs a success message to the console.
	 * @param {string} title - The title of the log.
	 * @param {string} message - The message to log.
	 */
	static success(title, message) {
		console.log(
			chalk.bold.cyan(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.green(message)
		);
	}

	/**
	 * Logs a warning message to the console.
	 * @param {string} title - The title of the log.
	 * @param {string} message - The message to log.
	 */
	static warn(title, message) {
		console.warn(
			chalk.bold.yellow(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.yellow(message)
		);
	}

	/**
	 * Logs an informational message to the console.
	 * @param {string} title - The title of the log.
	 * @param {string} message - The message to log.
	 */
	static info(title, message) {
		console.log(
			chalk.bold.blue(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.white(message)
		);
	}

	/**
	 * Logs a debug message to the console if the debug flag is set.
	 * @param {string} title - The title of the log.
	 * @param {string} message - The message to log.
	 */
	static debug(title, message) {
		if (process.env.debugFlag !== "yes") {
			return;
		}
		console.log(
			chalk.bold.magenta(`[Debug - ${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.white(message)
		);
	}

	/**
	 * Logs an error message and stack trace to the console.
	 * @param {string} title - The title of the log.
	 * @param {string} message - The message to log.
	 * @param {Error} [error] - The error object (optional).
	 */
	static error(title, message, error) {
		console.error(
			chalk.bold.red(`[${title}]`) +
				chalk.grey(" > ") +
				chalk.bold.red(message)
		);

		if (error instanceof Error && error.stack) {
			console.log("\n" + chalk.grey("[========= BEGIN =========]"));
			console.error(chalk.bold.red(error.stack));
			console.log(chalk.grey("[========= END ==========]") + "\n");
		}
	}
}

export default Logger;
