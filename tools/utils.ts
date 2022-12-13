import { green, red } from "https://deno.land/std@0.166.0/fmt/colors.ts";

const maxLength = ["[Error]", "[Request]", "[Walk]"].reduce(
  (a, b) => Math.max(a, b.length),
  0,
);

export function log(
  category: "Request" | "Walk" | "Info" | "Error",
  message: string,
  indentLevel?: number,
) {
  // console.log(`${"  ".repeat(indentLevel || 0)}[${category == "Error" ? red(category) : green(category)}] ${message}`)
  console.log(
    `${"  ".repeat(indentLevel || 0)}${
      (category == "Error" ? red : green)(`[${category}]`.padEnd(maxLength))
    } ${message}`,
  );
}
