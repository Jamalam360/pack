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
  "https://raw.githubusercontent.com/Jamalam360/pack/deploy/categories.json",
)).json();

let modsByCategory:
  | ModsByCategory
  | null = null;

await refresh();
modsByCategory = await getModsByCategory();

export async function refresh() {
  categories = await (await fetch(
    "https://raw.githubusercontent.com/Jamalam360/pack/deploy/categories.json",
  )).json();

  modsByCategory = null;
  modsByCategory = await getModsByCategory();
}

export async function getModsByCategory(): Promise<ModsByCategory> {
  if (modsByCategory != null) {
    console.log("Using cached modsByCategory");
    return modsByCategory;
  }

  console.log("Fetching modsByCategory");

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
        `${data.name} (${file.name.split(".pw.toml")[0]})`,
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

  console.log(`Found ${mods.length} mods in category ${category}`);

  mods = mods.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

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
