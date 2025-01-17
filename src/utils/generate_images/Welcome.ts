import { createCanvas, loadImage } from "@napi-rs/canvas";
import { GuildInfo, Player } from "../api/GuildData";
import { AttachmentBuilder } from "discord.js";
import TextBuilder from "../TextBuilder";
import Color from "../../types/Color";

export default async function getWelcomeImage(
  player: Player
): Promise<AttachmentBuilder> {
  const canvas = createCanvas(700, 300);
  const context = canvas.getContext("2d");

  const background = await loadImage("./src/assets/images/background.png");

  context.drawImage(
    background,
    0,
    -50,
    canvas.width,
    (background.height / background.width) * canvas.width
  ); // background image

  context.fillStyle = "#00000040";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const avatar = await loadImage(
    `https://nmsr.nickac.dev/fullbody/${player.uuid}`
  );

  context.drawImage(
    avatar,
    canvas.width / 2 - 100,
    70,
    200,
    (avatar.height / avatar.width) * 200
  ); // player model

  type Rank = {
    rankName?: "VIP" | "VIP_PLUS" | "MVP" | "MVP_PLUS";
    overrideRank?: string;
    plusColor?: string;
    isPremium: boolean;
  };

  let rankStuff: Rank = {
    rankName: player.newPackageRank,
    plusColor: player.rankPlusColor,
    isPremium:
      player.monthlyPackageRank != "NONE" && player.monthlyPackageRank != null,
  };

  let isNone: boolean = false;
  let rankName: string = "";
  let plus: string = "";
  let color: string = "";
  let rankColor: string = "";
  let plusColor: string = player.rankPlusColor;

  switch (rankStuff.rankName) {
    case null: {
      isNone = true;
      break;
    }
    case "VIP": {
      rankName = "VIP";
      plus = "";
      color = "GREEN";
      rankColor = "GREEN";
      break;
    }
    case "VIP_PLUS": {
      rankName = "VIP";
      plus = "+";
      color = "GREEN";
      rankColor = "GREEN";
      break;
    }
    case "MVP": {
      rankName = "MVP";
      plus = "";
      color = "AQUA";
      rankColor = "AQUA";
      break;
    }
    case "MVP_PLUS": {
      rankName = "MVP";
      plus = "+";
      color = "AQUA";
      rankColor = "AQUA";
      break;
    }
  }

  if (!rankStuff.rankName) isNone = true;

  if (isNone) {
    color = "GRAY";
    rankColor = "";
    rankName = "";
    plus = "";
    plusColor = "";
  }

  if (rankStuff.isPremium) {
    color = "GOLD";
    rankColor = "GOLD";
    rankName = "MVP";
    plus = "++";
  }

  if (player.rank != null) {
    color = "RED";
    rankColor = player.rank == "YOUTUBER" ? "WHITE" : "RED";
    rankName = player.rank;
    plus = "";
  }

  const nametagText = new TextBuilder(canvas, {
    size: 25,
    alignment: "center",
    vertical_alignment: "bottom",
    x: canvas.width / 2,
    y: 60,
    backgroundColor: "#00000080",
    shadow: false,
  })
    .appendText({ content: !isNone ? `[` : "", color: Color.fromString(color) })
    .appendText({ content: `${rankName}`, color: Color.fromString(rankColor) })
    .appendText({ content: `${plus}`, color: Color.fromString(plusColor) })
    .appendText({
      content: `${!isNone ? `] ` : ""}${player.displayname}`,
      color: Color.fromString(color),
    });

  const welcomeText = new TextBuilder(canvas, {
    size: 25,
    alignment: "center",
    vertical_alignment: "bottom",
    x: canvas.width / 2,
    y: canvas.height - 20,
    shadow: true,
  })
    .appendText({
      content: "♥",
      color: Color.RED,
      bold: true,
    })
    .appendText({
      content: " WELCOME TO INVITE ",
      color: Color.WHITE,
      bold: true,
    })
    .appendText({
      content: "♥",
      color: Color.RED,
      bold: true,
    });

  welcomeText.render();

  //   if (guild_info && guild_info.tag)
  //     join_message.appendText({
  //       content: ` [${guild_info.tag}]`,
  //       color: Color.fromString(guild_info.tagColor),
  //     });

  nametagText.render();

  return new AttachmentBuilder(await canvas.encode("png"), {
    name: "profile-image.png",
  });
}
