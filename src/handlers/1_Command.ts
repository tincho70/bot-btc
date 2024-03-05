/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Routes, SlashCommandBuilder, REST } from "discord.js";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../types";

module.exports = (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = [];

  const slashCommandsDir = join(__dirname, "../commands");

  existsSync(slashCommandsDir) &&
    readdirSync(slashCommandsDir).forEach((file) => {
      if (!file.endsWith(".js")) return;
      const command: SlashCommand =
        require(`${slashCommandsDir}/${file}`).default;
      client.slashCommands.set(command.command.name, command);
      slashCommands.push(command.command);
    });

  const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN!
  );

  if (process.env.NODE_ENV == "production") {
    rest
      .put(Routes.applicationCommands(process.env.DISCORD_APP_ID!), {
        body: slashCommands.map((command) => command.toJSON()),
      })
      .then((data: any) => {
        console.info(`🔶 Successfully loaded ${data.length} slash command(s)`);
      })
      .catch((e) => {
        console.error(e);
      });
  } else {
    // In development, I only deploy to the development server
    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_APP_ID!,
          process.env.DISCORD_GUILD_ID!
        ),
        {
          body: slashCommands.map((command) => command.toJSON()),
        }
      )
      .then((data: any) => {
        console.info(
          `🔶 Successfully loaded ${data.length} slash command(s) in GUILD_ID ${process.env.DISCORD_GUILD_ID}`
        );
      })
      .catch((e) => {
        console.error(e);
      });
  }
};
