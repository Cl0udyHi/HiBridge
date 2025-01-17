import { Canvas, loadImage } from "@napi-rs/canvas";
import { GuildMember } from "../api/GuildData";
import { AttachmentBuilder, Widget } from "discord.js";
import TextBuilder from "../TextBuilder";
import Color from "../../types/Color";
import getPlayerName from "../api/Mojang";

export default async function generateLeaderboard(
  list: Record<number, GuildMember>[]
): Promise<AttachmentBuilder> {
  const canvas = new Canvas(500, 20 * 17 + 25);
  const context = canvas.getContext("2d");

  const background = await loadImage(`./src/assets/images/background.png`);
  context.drawImage(
    background,
    0,
    0,
    (background.width / background.height) * canvas.height,
    canvas.height
  );

  new TextBuilder(canvas, {
    size: 25,
    x: canvas.width / 2,
    y: 10,
    alignment: "center",
    shadow: true,
  })
    .appendText({ content: "Top 10", color: Color.WHITE, bold: true })
    .newLine()
    .appendText({
      content: "Weekly Guild Experience",
      color: Color.WHITE,
      bold: true,
    })
    .render();

  const spacing: number = 10;

  const names = new TextBuilder(canvas, {
    size: 20,
    x: 15,
    y: canvas.height - 15,
    vertical_alignment: "bottom",
    spacing: spacing,
    shadow: true,
    backgroundColor: "#00000080",
    backgroundPadding: 5,
    backgroundWidth: canvas.width - 15 * 2,
  });

  const scores = new TextBuilder(canvas, {
    size: 20,
    x: canvas.width - 15,
    y: canvas.height - 15,
    alignment: "right",
    vertical_alignment: "bottom",
    spacing: spacing,
    shadow: true,
  });

  for (const record of list) {
    const index = list.indexOf(record);

    for (const exp in record) {
      const member = record[exp];

      const name: string = await getPlayerName(member.uuid);

      context.fillStyle = "#00000080";
      context.fillRect(
        canvas.width - 15,
        (canvas.height - 15) * 20,
        canvas.width - 15 * 2,
        20
      );

      names
        .appendText({
          content: `#`,
          color: Color.YELLOW,
        })
        .appendText({
          content: `${index + 1} `,
          color: Color.YELLOW,
          bold: true,
        })
        .appendText({ content: name })
        .newLine();

      scores.appendText({ content: exp, color: Color.YELLOW }).newLine();
    }
  }

  names.render();
  scores.render();

  return new AttachmentBuilder(await canvas.encode("png"), {
    name: "profile-image.png",
  });
}
