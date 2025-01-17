import "dotenv/config";
import {
  ActivityType,
  AttachmentBuilder,
  Guild,
  GuildBasedChannel,
  TextChannel,
  VoiceChannel,
  GatewayIntentBits,
} from "discord.js";

import CommandHandler from "./utils/CommandHandler";
import ExtendedClient from "./utils/ExtendedClient";
import {
  getGuildMembers,
  getPlayer,
  GuildInfo,
  GuildMember,
  Player,
} from "./utils/api/GuildData";
import getWelcomeImage from "./utils/generate_images/Welcome";

const config = require("../config.json");

const path = require("node:path");

const client = new ExtendedClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

const commandHandler = new CommandHandler(client);

client.commands = commandHandler.loadCommands(
  path.resolve(__dirname, "commands/discord")
);
commandHandler.registerCommands();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

let guild_members: GuildMember[];
let guild_info: GuildInfo;

async function updateMemberCount() {
  const server: Guild | undefined = client.user?.client.guilds.cache.get(
    config.server_id
  );
  const membersCount: GuildBasedChannel | undefined =
    server?.channels.cache.get(config.channels.membersCount) as
      | VoiceChannel
      | undefined;
  const count = guild_members.length;

  membersCount?.setName("Members: " + count);

  await client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "customstates",
        state: `${count} Members!`,
        type: ActivityType.Custom,
      },
    ],
  });
}

client.on("ready", async (c) => {
  console.log(`${c.user.username} is online!`);

  const server: Guild | undefined = c.guilds.cache.get(config.server_id);
  const joinChannel: GuildBasedChannel | undefined = server?.channels.cache.get(
    config.channels.welcome
  );

  guild_members = await getGuildMembers();
  updateMemberCount();

  setInterval(async () => {
    const newMembers: GuildMember[] = await getGuildMembers();
    const members: GuildMember[] = [];

    for (const currentMember of newMembers) {
      if (!guild_members.some((member) => member.uuid === currentMember.uuid)) {
        members.push(currentMember);
      }
    }

    if (members.length > 0) {
      members.forEach(async (member) => {
        const player: Player | undefined = await getPlayer(member.uuid);
        if (!player) return;

        const attachment: AttachmentBuilder = await getWelcomeImage(player);

        (joinChannel as TextChannel).send({ files: [attachment] });
      });

      guild_members = newMembers;

      console.log("Found new members: \n" + members);
    }

    updateMemberCount();
  }, 60 * 1000);
});

client.login(process.env.TOKEN);
