import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../src/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "badges");

const LABELS = ["built-on", "powered-by"] as const;
const THEMES = ["dark", "light", "auto"] as const;
const SIZES = ["sm", "md", "lg"] as const;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const label of LABELS) {
  for (const theme of THEMES) {
    for (const size of SIZES) {
      writeFileSync(
        resolve(outDir, `${label}-${theme}-${size}.svg`),
        render({ label, theme, size }),
      );
    }
  }
}

// Shortcuts for the common case: the default label and size in each theme.
for (const theme of THEMES) {
  writeFileSync(resolve(outDir, `${theme}.svg`), render({ theme }));
}
