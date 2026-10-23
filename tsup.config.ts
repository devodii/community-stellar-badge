import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const { version } = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
  },
  {
    entry: { embed: "src/embed.ts" },
    format: ["iife"],
    platform: "browser",
    minify: true,
    banner: { js: `/* community-stellar-badge v${version} */` },
    outExtension: () => ({ js: ".js" }),
  },
]);
