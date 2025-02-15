import Logger from "../utils/logger.js";
import chalk from "chalk";
export default async (/*client*/) => {
	// Handle unhandled promise rejections
	process.on("unhandledRejection", (reason /*, promise */) => {
		Logger.error(
			"Unhandled Rejection",
			chalk.red(reason.toString()),
			reason
		);
	});
	// Handle uncaught exceptions
	process.on("uncaughtException", async (err, origin) => {
		Logger.error(
			"Uncaught Exception",
			chalk.red(`Error: ${err.toString()}`),
			err
		);
		if (origin) {
			Logger.info("Exception Origin", origin);
		}
	});
	// Monitor uncaught exceptions
	process.on("uncaughtExceptionMonitor", async (err, origin) => {
		Logger.warn(
			"Uncaught Exception Monitor",
			chalk.yellow(`Error: ${err.toString()}`)
		);
		if (origin) {
			Logger.info("Exception Origin", origin);
		}
	});
	// Handle warnings
	process.on("warning", async (warn) => {
		Logger.warn(
			"Warning",
			chalk.yellow(`Warning: ${warn.name} ${warn.message} ${warn.stack}`)
		);
	});
	// process.on("SIGINT", async () => {
	// 	try {
	// 		Logger.warn("OS", chalk.yellow("Killing client..."));
	// 		await client.destroy();
	// 		Logger.warn("OS", chalk.yellow("Client killed"));
	// 	} catch (error) {
	// 		Logger.error("OS", chalk.red("Error killing client"), error);
	// 	} finally {
	// 		Logger.warn("OS", chalk.yellow("Exiting process..."));
	// 		process.exit(0);
	// 	}
	// });

	Logger.info("Anti-Crash", "Loaded");
};
