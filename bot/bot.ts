import {
  Client,
  event,
  Intents,
  Interaction,
  InteractionApplicationCommandData,
  slash,
} from "https://code.harmony.rocks/v2.6.0/mod.ts";
import { config } from "https://deno.land/std@v0.141.0/dotenv/mod.ts";
import { getModsByCategory, getPaginatedMods } from "./pack.ts";

import { commands } from "./commands.ts";

await config({ export: true });

class Bot extends Client {
  @event()
  ready() {
    console.log("Initialized");

    commands.forEach((command) => {
      this.interactions.commands.create(command, Deno.env.get("GUILD_ID"))
        .then((cmd) => console.log(`Created Slash Command ${cmd.name}!`))
        .catch(() =>
          console.error(`Failed to create ${command.name} command!`)
        );
    });
  }

  @slash()
  help(interaction: Interaction) {
    interaction.respond({
      content:
        "This bot is a utility for fetching information about the Tree Gang Minecraft server. It has the commands /mods and /count.",
    });
  }

  @slash()
  mods(interaction: Interaction) {
    const options = interaction.data as InteractionApplicationCommandData;
    const category = options.options.find((e) => e.name == "category")?.value ||
      "all";
    const page = options.options.find((e) => e.name == "page")?.value || 1;

    getPaginatedMods(category, page).then((res) => {
      const mods = res.mods.map((mod) => `- ${mod}`).join("\n");
      const message = `
${
        category.charAt(0).toUpperCase() + category.slice(1)
      } [${page}/${res.totalPages}]:
\`\`\`
${mods}
\`\`\`
      `;

      interaction.respond({
        content: message,
      });
    }).catch((err) => {
      interaction.respond({
        content: "Failed to fetch mods!",
      });
      console.error(err);
    });
  }

  @slash()
  count(interaction: Interaction) {
    getModsByCategory().then((res) => {
      interaction.respond({
        content: `There are ${
          Object.keys(res.categories).reduce((count, current) =>
            count + current.length, 0) + res.failures
        } mods on the server.`,
      });
    });
  }
}

const client = new Bot();

client.connect(Deno.env.get("BOT_TOKEN"), Intents.None);
