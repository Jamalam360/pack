import { emptyDir, ensureDir } from "https://deno.land/std@0.140.0/fs/mod.ts";
import { download } from "https://deno.land/x/download@v1.0.1/mod.ts";
import { FTPClient } from "https://deno.land/x/ftpc@v1.3.0/mod.ts";

console.log("Ignoring upload to server.");
Deno.exit(0);

try {
  // Parse and verify arguments
  if (Deno.args.length < 2) {
    throw new Error("Incorrect arguments provided");
  }

  const ftpHost = Deno.args[0];
  const ftpUser = Deno.args[1];
  const ftpPass = Deno.args[2];

  // Ensure the ./tmp directory exists, and empty it
  await ensureDir("./tmp");
  await emptyDir("./tmp");

  // Download the Packwiz installer bootstrap
  await download(
    "https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar",
    {
      file: "packwiz-installer-bootstrap.jar",
      dir: "./tmp",
    },
  );

  // Sleep for 15 seconds to ensure the pack has been updated on the hosting server
  await sleep(15_000);

  // Run the Packwiz installer bootstrap
  const p = Deno.run({
    cmd: [
      "java",
      "-jar",
      "packwiz-installer-bootstrap.jar",
      "-g",
      "-s",
      "server",
      "https://pack.jamalam.tech/pack.toml",
    ],
    cwd: "./tmp",
    stdout: "piped",
    stderr: "piped",
  });

  if (!(await p.status()).success) {
    throw new Error(
      `Packwiz installer bootstrap failed with exit code: ${
        (await p.status()).code
      }`,
    );
  }

  // Remove the Packwiz installer bootstrap
  await Deno.remove("./tmp/packwiz-installer-bootstrap.jar");

  // Upload the pack to the Mincecraft server
  const ftpClient = new FTPClient(ftpHost, {
    user: ftpUser,
    pass: ftpPass,
    port: 21,
  });

  for await (const file of Deno.readDir("./tmp/mods")) {
    if (file.isFile && file.name.endsWith(".jar")) {
      await ftpClient.upload(
        `./mods/${file.name}`,
        await (await (await Deno.open(file.name)).readable.getReader().read())
          .value!,
      );
    }
  }
} finally {
  // await Deno.remove("./tmp");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
