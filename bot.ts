import {
  json,
  serve,
  validateRequest,
} from "https://deno.land/x/sift@0.5.0/mod.ts";
import nacl from "https://cdn.skypack.dev/tweetnacl@v1.0.3?dts";
import toml from "https://esm.sh/toml@3.0.0";

serve({
  "/": command,
});

async function command(request: Request) {
  const { error } = await validateRequest(request, {
    POST: {
      headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
    },
  });
  if (error) {
    return json({ error: error.message }, { status: error.status });
  }

  const { valid, body } = await verifySignature(request);
  if (!valid) {
    return json(
      { error: "Invalid request" },
      {
        status: 401,
      },
    );
  }

  const { type = 0, _data = { options: [] } } = JSON.parse(body);
  if (type === 1) {
    return json({
      type: 1,
    });
  }

  if (type === 2) {
    const req = await fetch(
      "https://api.github.com/repos/Jamalam360/pack/contents/mods",
    );

    const modNames: string[] = [];

    for (const file of await req.json()) {
      const r = await fetch(file.download_url);
      const data = toml.parse(await r.text());
      if (data.name) {
        modNames.push(`- ${data.name}`);
      } else {
        modNames.push("[Failed to prase name]");
        console.log("Failed to parse: " + data);
      }
    }

    return json({
      type: 4,
      data: {
        content: `
Mods:
\`\`\`
${modNames.join("\n")}
\`\`\`
        `,
      },
    });
  }

  return json({ error: "bad request" }, { status: 400 });
}

async function verifySignature(
  request: Request,
): Promise<{ valid: boolean; body: string }> {
  const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
  const signature = request.headers.get("X-Signature-Ed25519")!;
  const timestamp = request.headers.get("X-Signature-Timestamp")!;
  const body = await request.text();
  const valid = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    hexToUint8Array(signature),
    hexToUint8Array(PUBLIC_KEY),
  );

  return { valid, body };
}

function hexToUint8Array(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)));
}
