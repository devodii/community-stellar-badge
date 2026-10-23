import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../src/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "badges");

const THEMES = ["dark", "light", "auto"] as const;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const theme of THEMES) {
  writeFileSync(resolve(outDir, `${theme}.svg`), render({ theme }));
}
