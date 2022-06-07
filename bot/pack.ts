import toml from "https://esm.sh/toml@3.0.0";

interface ModsByCategory {
  categories: Record<string, string[]>;
  failures: number;
}

interface PaginatedMods {
  mods: string[];
  totalPages: number;
}

let categories = await (await fetch(
  "https://raw.githubusercontent.com/Jamalam360/pack/main/categories.json",
)).json();

let lastCache = new Date();

let modsByCategory:
  | ModsByCategory
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

export async function getModsByCategory(): Promise<ModsByCategory> {
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

export async function getPaginatedMods(
  category: string,
  page: number,
): Promise<PaginatedMods> {
  const categories = await getModsByCategory();

  if (!categories.categories[category] && category != "all") {
    return {
      mods: [],
      totalPages: 0,
    };
  }

  let mods: string[] = [];

  if (category == "all") {
    for (const cat in categories.categories) {
      mods = mods.concat(categories.categories[cat]);
    }
  } else {
    mods = categories.categories[category];
  }

  mods = mods.sort();

  const totalPages = Math.ceil(mods.length / 35);

  return {
    mods: mods.slice((page - 1) * 35, page * 35),
    totalPages: totalPages,
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
