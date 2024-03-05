/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from "discord.js";
import { YadioPrice } from "./service/Yadio.d";
import { Block } from "@mempool/mempool.js/lib/interfaces/bitcoin/blocks";

export interface SlashCommand {
  command: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  cooldown?: number; // in seconds
}

declare module "discord.js" {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
    lastBlock: Block | null;
    averageBlockTime: number | null;
    updateLastBlock: (block: Block) => void;
    updateTicker: (oldPrice: YadioPrice | null) => Promise<YadioPrice | null>;
  }
}

export interface BotEvent {
  name: string; // Nombre del evento
  once?: boolean | false; // Por única vez?
  execute: (...args) => void; // Ejecución del evento
}
