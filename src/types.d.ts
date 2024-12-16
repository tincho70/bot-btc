/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from "discord.js";
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
    lastPrice: number;
    averageBlockTime: number | null;
    fees: Fees | null;
    updateLastBlock: (block: Block) => void;
    updateTicker: (price?: number, open24h?: number) => void;
    nextStatus: ["change" | "fees", number];
  }
}
export interface Fees {
  economy: number;
  low: number;
  medium: number;
  high: number;
  timestamp: number;
}
export interface BotEvent {
  name: string; // Nombre del evento
  once?: boolean | false; // Por única vez?
  execute: (...args) => void; // Ejecución del evento
}
