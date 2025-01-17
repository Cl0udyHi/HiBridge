import { Canvas, GlobalFonts, SKRSContext2D } from "@napi-rs/canvas";
import Color from "../types/Color";

export enum Decoration {
  BOLD,
  ITALIC,
}

export type TextOptions = {
  content: string;
  color: Color;
  bold?: boolean;
  italic?: boolean;
  customFont?: string;
};

export type BuilderOptions = {
  size: number;
  alignment?: "left" | "center" | "right";
  vertical_alignment?: "top" | "center" | "bottom";
  x: number;
  y: number;
  backgroundColor?: string | "transparent";
  shadow?: boolean;
  spacing?: number;
  backgroundPadding?: number;
  backgroundWidth?: "full" | "line" | number;
};

class TextBuilder {
  private texts: (TextOptions | "\n")[] = [];
  private canvas: Canvas;
  private size: number;
  private alignment: "left" | "center" | "right";
  private vertical_alignment: "top" | "center" | "bottom";
  private x0: number;
  private y0: number;
  private backgroundColor: string | "transparent";
  private shadow: boolean;
  private spacing: number;
  private backgroundPadding: number;
  private backgroundWidth: "full" | "line" | number;

  constructor(canvas: Canvas, options: BuilderOptions) {
    this.canvas = canvas;
    this.size = options.size;
    this.alignment = options.alignment || "left";
    this.vertical_alignment = options.vertical_alignment || "top";
    this.x0 = options.x;
    this.y0 = options.y;
    this.backgroundColor = options.backgroundColor || "transparent";
    this.shadow = options.shadow ?? false;
    this.spacing = options.spacing || 0;
    this.backgroundPadding = options.backgroundPadding || 0;
    this.backgroundWidth = options.backgroundWidth || "line";
  }

  private getFontType(text: TextOptions): string {
    let fontType: string = "NORMAL";

    if (text.bold) fontType = "BOLD";
    if (text.italic) fontType = "ITALIC";
    if (text.bold && text.italic) fontType = "BOLD_ITALIC";

    let font = `Minecraft_${fontType}`;

    if (text.customFont) font = text.customFont;

    return font;
  }

  private getTextColor(text: TextOptions): string {
    const { hue, saturation, lightness } = text.color.hsl;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private getShadowColor(text: TextOptions): string {
    const { hue, saturation, lightness } = text.color.hsl;
    return `hsl(${hue}, ${saturation}%, ${Math.max(lightness / 5, 0)}%)`;
  }

  appendText(options: {
    content: string;
    color?: Color;
    bold?: boolean;
    italic?: boolean;
    customFont?: string;
  }): this {
    const args = options.content.split("\n");

    for (let i = 0; i < args.length; i++) {
      const newText: TextOptions = {
        content: args[i],
        color: options.color ? options.color : Color.WHITE,
        bold: options.bold,
        italic: options.italic,
        customFont: options.customFont,
      };

      this.texts.push(newText);

      if (0 < i && i < args.length - 1) this.texts.push("\n");
    }

    return this;
  }

  newLine(): this {
    this.texts.push("\n");

    return this;
  }

  render() {
    const context: SKRSContext2D = this.canvas.getContext("2d");

    context.save();

    GlobalFonts.registerFromPath(
      `./src/assets/fonts/Minecraft_Normal.otf`,
      "Minecraft_NORMAL"
    );

    GlobalFonts.registerFromPath(
      `./src/assets/fonts/Minecraft_Italic.otf`,
      "Minecraft_ITALIC"
    );

    GlobalFonts.registerFromPath(
      `./src/assets/fonts/Minecraft_Bold.otf`,
      "Minecraft_BOLD"
    );

    GlobalFonts.registerFromPath(
      `./src/assets/fonts/Minecraft_Bold_Italic.otf`,
      "Minecraft_BOLD_ITALIC"
    );

    let lines: TextOptions[][] = [];
    let currentLine: TextOptions[] = [];

    for (const arg of this.texts) {
      if (arg === "\n") {
        lines.push(currentLine);

        currentLine = [];
        continue;
      }

      currentLine.push(arg);
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    let widths: number[] = [];

    for (const line of lines) {
      let lineWidth: number = 0;

      for (const word of line) {
        let font = this.getFontType(word);

        context.font = `${this.size}px ${font}`;
        context.textAlign = "start";

        lineWidth += context.measureText(word.content).width;
      }

      widths.push(lineWidth);
    }

    let totalWidth: number = widths.length > 0 ? Math.max(...widths) : 0;
    let totalHeight: number =
      lines.length * this.size + this.spacing * lines.length;

    let y = this.y0;

    for (const line of lines) {
      let lineWidth: number = 0;

      for (const word of line) {
        let font = this.getFontType(word);

        context.font = `${this.size}px ${font}`;
        context.textAlign = "start";

        lineWidth += context.measureText(word.content).width;
      }

      let x = this.x0;
      let lineX0 = this.x0;

      if (this.alignment == "right") {
        lineX0 = this.x0 - lineWidth;
        x = this.x0 - lineWidth;
      }

      if (this.alignment == "center") {
        lineX0 = this.x0 - lineWidth / 2;
        x = this.x0 - lineWidth / 2;
      }

      if (this.vertical_alignment == "center") {
        y =
          this.y0 -
          totalHeight / 2 +
          (lines.indexOf(line) + 1) * (this.size + this.spacing);
      } else {
        if (this.vertical_alignment == "bottom") y = this.y0 - totalHeight;

        y += (lines.indexOf(line) + 1) * (this.size + this.spacing);
      }

      // Background color
      if (this.backgroundColor) {
        context.save();

        let width = this.backgroundWidth == "full" ? totalWidth : lineWidth;
        if (typeof this.backgroundWidth == "number")
          width = this.backgroundWidth;

        context.shadowBlur = 0;
        context.shadowColor = "transparent";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.fillStyle = this.backgroundColor;
        context.fillRect(
          lineX0 - this.size / 10 - this.backgroundPadding,
          y - this.size + this.size / 5 - this.backgroundPadding,
          width + (this.size / 10) * 2 + this.backgroundPadding * 2,
          this.size + this.backgroundPadding * 2
        );

        context.restore();
      }

      for (const text of line) {
        const index = line.indexOf(text);
        const previousText: TextOptions = line[index - 1];

        if (previousText)
          x = x + context.measureText(previousText.content).width;

        // ▼===========================================================▼
        //                        ▼ Rendering ▼
        // ▼===========================================================▼

        // Colors
        const text_color: string = this.getTextColor(text);

        // Text Shadow
        if (this.shadow) {
          const shadow_color: string = this.getShadowColor(text);

          context.shadowBlur = 0;
          context.shadowColor = shadow_color;
          context.shadowOffsetX = this.size / 10.5;
          context.shadowOffsetY = this.size / 10.5;
        } else {
          context.shadowBlur = 0;
          context.shadowColor = "transparent";
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
        }

        let font = this.getFontType(text);

        context.font = `${this.size}px ${font}`;
        context.fillStyle = text_color;
        context.textAlign = "start";

        context.fillText(text.content, x, y);
      }
    }

    context.restore();
  }
}

export default TextBuilder;
