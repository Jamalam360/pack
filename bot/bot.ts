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

function transformCategoryName(name: string): string {
  name = name.replaceAll("-", " ");

  name = name.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  return name;
}

class Bot extends Client {
  @event()
  ready() {
    console.log("Initialized");

    commands.forEach((command) => {
      this.interactions.commands.create(command, Deno.env.get("GUILD_ID"))
        .then((cmd) => console.log(`Created Slash Command ${cmd.name}!`))
        .catch((err) => {
          console.error(`Failed to create ${command.name} command!`);
          console.error(err);
        });
    });
  }

  @slash()
  help(interaction: Interaction) {
    interaction.respond({
      content:
        "This bot is a utility for fetching information about the Tree Gang Minecraft server. It has the commands /mods, /refresh, /ping, and /count.",
    });
  }

  @slash()
  mods(interaction: Interaction) {
    const options = interaction.data as InteractionApplicationCommandData;
    const category = options.options.find((e) => e.name == "category")?.value ??
      "all";
    const page = options.options.find((e) => e.name == "page")?.value ?? 1;

    getPaginatedMods(category, page).then((res) => {
      const mods = res.mods.map((mod) => `- ${mod}`).join("\n");
      const message = `
${transformCategoryName(category)} [${page}/${res.totalPages}]:
\`\`\`
${mods}
\`\`\`
      `;

      if (page > res.totalPages) {
        interaction.respond({
          content: "That page does not exist.",
        });
      }

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
      let size = 0;

      for (const cat in res.categories) {
        size += res.categories[cat].length;
      }

      interaction.respond({
        content: `There are ${size} mods on the server.`,
      });
    });
  }

  @slash()
  refresh(interaction: Interaction) {
    if (interaction.user.id != "478579885951156225") {
      interaction.respond({
        content: "You do not have permission to do that.",
      });

      return;
    }

    interaction.respond({
      content: "Refreshing mods...",
    });

    getModsByCategory().then((res) => {
      console.log(
        `Found ${res.categories.length} categories with ${res.failures} failures`,
      );
    }).catch((err) => {
      console.log("Failed to refresh mods!");
      console.error(err);
    });
  }

  @slash()
  ping(interaction: Interaction) {
    interaction.respond({
      content: "Pong!",
    });
  }
}

const client = new Bot();

client.connect(Deno.env.get("BOT_TOKEN"), Intents.None);
