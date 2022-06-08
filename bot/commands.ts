import {
  ApplicationCommandChoice,
  SlashCommandOptionType,
  SlashCommandPartial,
} from "https://code.harmony.rocks/v2.6.0/mod.ts";

function createChoice(value: string): ApplicationCommandChoice {
  return {
    name: value,
    value: value,
  };
}

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
        choices: [
          createChoice("all"),
          createChoice("uncategorised"),
          createChoice("worldgen"),
          createChoice("magic"),
          createChoice("combat-and-tools"),
          createChoice("technology"),
          createChoice("building"),
          createChoice("entities"),
          createChoice("ambient"),
          createChoice("performance"),
          createChoice("visuals"),
          createChoice("quality-of-life"),
          createChoice("other-and-utility"),
          createChoice("bug-fixes"),
          createChoice("library"),
        ],
      },
      {
        name: "page",
        type: SlashCommandOptionType.NUMBER,
        description: "Page number",
      },
    ],
  },
  {
    name: "count",
    "description": "Show the number of mods on the server",
    options: [],
  },
];
