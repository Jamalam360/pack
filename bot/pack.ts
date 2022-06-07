import toml from "https://esm.sh/toml@3.0.0";

let categories = await (await fetch(
  "https://raw.githubusercontent.com/Jamalam360/pack/main/categories.json",
)).json();

let lastCache = new Date();

let modsByCategory:
  | { categories: Record<string, string[]>; failures: number }
  | null = null;

async function checkCache() {
  if (new Date().getTime() - lastCache.getTime() > 900000) {
    categories = await (await fetch(
      "https://raw.githubusercontent.com/Jamalam360/pack/main/categories.json",
    )).json();
    modsByCategory = null;

    lastCache = new Date();
  }
}

export async function getModsByCategory(): Promise<
  { categories: Record<string, string[]>; failures: number }
> {
  await checkCache();

  if (modsByCategory != null) {
    return modsByCategory;
  }

  const req = await fetch(
    "https://api.github.com/repos/Jamalam360/pack/contents/mods",
  );

  const mods: Record<string, string[]> = {};
  let failures = 0;

  for (const file of await req.json()) {
    const r = await fetch(file.download_url);
    const data = toml.parse(await r.text());
    if (data.name) {
      const category = getCategory(
        file.name.split(".pw.toml")[0],
        categories,
      );

      if (!mods[category]) {
        mods[category] = [];
      }

      mods[category].push(
        data.name,
      );
    } else {
      failures++;
      console.log("Failed to parse: " + data);
    }
  }

  return {
    categories: mods,
    failures: failures,
  };
}

function getCategory(name: string, categories: Record<string, string[]>) {
  for (const category in categories) {
    if (categories[category].includes(name)) {
      return category;
    }
  }

  return "uncategorised";
}
