import { MessageFlags } from "discord.js";
import { basicEmbed } from "../../../utils/embeds.js";
import db from "../../../utils/db.js";

export default async (client, interaction) => {
    await interaction.reply(
        {
            embeds:[
                basicEmbed(
                    "Refreshing cache",
                    "> Please wait...",
                    null,
                    "#2f3136",
                    null,
                    null,
                    null,
                    null,
                    null
                )
            ],
            flags: MessageFlags.Ephemeral
        }
    );

    const data = await db.read("../metadata");

    for (const x of data.filepaths) {
        const fileData = await db.read(x); // Fetch the data for each file path
        for (const key of Object.keys(fileData)) { // Iterate over the keys one by one
            await db.delete(x, key); // Delete each key sequentially
        }
    }

    await interaction.editReply(
        {
            embeds:[
                basicEmbed(
                    "Cache refreshed!",
                    "> Done!",
                    null,
                    "Green",
                    null,
                    null,
                    null,
                    null,
                    null
                )
            ],
            flags: MessageFlags.Ephemeral
        }
    );
};
