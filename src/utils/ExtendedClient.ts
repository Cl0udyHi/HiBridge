import { Client, Collection } from "discord.js";

export default class ExtendedClient extends Client {
  commands: Collection<string, any>;

  constructor(options: any) {
    super(options);
    this.commands = new Collection();
  }
}
