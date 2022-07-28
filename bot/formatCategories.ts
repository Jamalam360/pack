import { exists } from "https://deno.land/std@v0.149.0/fs/mod.ts";

const categories: Record<string, string[]> = JSON.parse(
  await Deno.readTextFile(Deno.args[0]),
);

// Discard mods that are no longer present
for (const category of Object.keys(categories)) {
  const newCategory: string[] = [];

  for (const mod of categories[category]) {
    if (await exists(`${Deno.args[1]}/${mod}.pw.toml`)) {
      newCategory.push(mod);
    }
  }

  categories[category] = newCategory;
}

// Sort mods alphabetically
for (const category of Object.keys(categories)) {
  categories[category] = categories[category].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

// Remove mods that don't have a .pw.toml file
for (const category of Object.keys(categories)) {
  const newCategory: string[] = [];

  for (const mod of categories[category]) {
    if (await exists(`${Deno.args[1]}/${mod}.pw.toml`)) {
      newCategory.push(mod);
    }
  }

  categories[category] = newCategory;
}

await Deno.writeTextFile(Deno.args[0], JSON.stringify(categories, null, 2));
