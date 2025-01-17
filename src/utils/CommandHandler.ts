import { Client, Collection } from "discord.js";
import path from "path";
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { bot_id, server_id } from "../../config.json";
import ExtendedClient from "./ExtendedClient";

class CommandHandler {
  commands: Collection<string, any>;

  constructor(private client: ExtendedClient) {
    this.commands = new Collection();
  }

  loadCommands(commandsDir: string) {
    const commandFolders = fs.readdirSync(commandsDir);
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsDir, folder);
      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".ts"));

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
          this.commands.set(command.data.name, command);
        } else {
          console.warn(
            `[WARNING] Command at ${filePath} is missing a "data" or "execute" property.`
          );
        }
      }
    }

    return this.commands;
  }

  async registerCommands() {
    const rest = new REST({ version: "10" }).setToken(
      process.env.TOKEN as string
    );
    try {
      console.log("Started refreshing application (/) commands.");

      const commands = this.client.commands.map((command) =>
        command.data.toJSON()
      );

      await rest.put(Routes.applicationGuildCommands(bot_id, server_id), {
        body: commands,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error("Error during command registration:", error);
    }
  }
}

export default CommandHandler;
