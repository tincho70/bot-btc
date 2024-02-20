/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Collection,
  SlashCommandBuilder,
  CommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import { YadioPrice } from "./service/Yadio.d";

export interface SlashCommand {
  data: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    updateTicker: (oldPrice: YadioPrice | null) => Promise<YadioPrice | null>;
  }
}

export interface BotEvent {
  name: string; // Nombre del evento
  once?: boolean | false; // Por única vez?
  execute: (...args) => void; // Ejecución del evento
}
