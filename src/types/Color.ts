export default class Color {
  static readonly WHITE = new Color("WHITE", {
    hue: 0,
    saturation: 0,
    lightness: 100,
  });
  static readonly YELLOW = new Color("YELLOW", {
    hue: 60,
    saturation: 100,
    lightness: 50,
  });
  static readonly LIGHT_PURPLE = new Color("LIGHT_PURPLE", {
    hue: 300,
    saturation: 100,
    lightness: 70,
  });
  static readonly RED = new Color("RED", {
    hue: 0,
    saturation: 100,
    lightness: 60,
  });
  static readonly AQUA = new Color("AQUA", {
    hue: 180,
    saturation: 100,
    lightness: 70,
  });
  static readonly DARK_AQUA = new Color("DARK_AQUA", {
    hue: 180,
    saturation: 100,
    lightness: 33,
  });
  static readonly GREEN = new Color("GREEN", {
    hue: 120,
    saturation: 100,
    lightness: 70,
  });
  static readonly BLUE = new Color("BLUE", {
    hue: 240,
    saturation: 100,
    lightness: 70,
  });
  static readonly DARK_GRAY = new Color("DARK_GRAY", {
    hue: 0,
    saturation: 0,
    lightness: 33,
  });
  static readonly GRAY = new Color("GRAY", {
    hue: 0,
    saturation: 0,
    lightness: 66,
  });
  static readonly GOLD = new Color("GOLD", {
    hue: 39,
    saturation: 100,
    lightness: 67,
  });
  static readonly DARK_PURPLE = new Color("DARK_PURPLE", {
    hue: 300,
    saturation: 100,
    lightness: 33,
  });
  static readonly DARK_RED = new Color("DARK_RED", {
    hue: 0,
    saturation: 100,
    lightness: 33,
  });
  static readonly DARK_GREEN = new Color("DARK_GREEN", {
    hue: 120,
    saturation: 100,
    lightness: 33,
  });
  static readonly DARK_BLUE = new Color("DARK_BLUE", {
    hue: 240,
    saturation: 100,
    lightness: 33,
  });
  static readonly BLACK = new Color("BLACK", {
    hue: 0,
    saturation: 0,
    lightness: 0,
  });

  private constructor(
    public readonly name: string,
    public readonly hsl: {
      hue: number;
      saturation: number;
      lightness: number;
    }
  ) {}

  static values(): Color[] {
    return [
      Color.WHITE,
      Color.YELLOW,
      Color.LIGHT_PURPLE,
      Color.RED,
      Color.AQUA,
      Color.GREEN,
      Color.BLUE,
      Color.DARK_GRAY,
      Color.GRAY,
      Color.GOLD,
      Color.DARK_PURPLE,
      Color.DARK_RED,
      Color.DARK_GREEN,
      Color.DARK_AQUA,
      Color.DARK_BLUE,
      Color.BLACK,
    ];
  }

  static fromString(name: string): Color {
    return this.values().find((color) => color.name === name) || Color.WHITE;
  }
}
