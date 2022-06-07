import {
  SlashCommandOptionType,
  SlashCommandPartial,
} from "https://code.harmony.rocks/v2.6.0/mod.ts";

export const commands: SlashCommandPartial[] = [
  {
    name: "help",
    description: "Show a help message",
    options: [],
  },
  {
    name: "mods",
    description: "Show a list of mods on the server",
    options: [
      {
        name: "category",
        type: SlashCommandOptionType.STRING,
        description: "Filter by category",
        choices: [],
      },
      {
        name: "page",
        type: SlashCommandOptionType.NUMBER,
        description: "Page number",
        default: true,
      },
    ],
  },
  {
    name: "count",
    "description": "Show the number of mods on the server",
    options: [],
  },
];
