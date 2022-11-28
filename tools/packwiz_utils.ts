import { parse as parseToml } from "https://deno.land/std@0.166.0/encoding/toml.ts";
import { walk } from "https://deno.land/std@0.166.0/fs/walk.ts";
import { log } from "./utils.ts";

type PackwizFile = {
  name: string;
  update?: {
    modrinth?: {
      "mod-id": string
    }
    [k: string]: unknown
  }
  [k: string]: unknown;
}

export function getPackwizFileFromFileContents(contents: string): PackwizFile {
  return parseToml(contents) as PackwizFile;
}

export async function findPackwizFiles(
  path: string,
): Promise<PackwizFile[]> {
  const files: PackwizFile[] = [];
  log("Walk", `Reading ${path}`);

  for await (const file of walk(path)) {
    if (file.isFile && file.path.endsWith(".pw.toml")) {
      files.push(parseToml(await Deno.readTextFile(file.path)) as PackwizFile);
    }
  }

  log("Walk", `Found ${files.length} files`);

  return files.sort((a, b) => a.name.localeCompare(b.name));
}
