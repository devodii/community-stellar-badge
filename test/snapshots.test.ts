import { describe, expect, it } from "vitest";
import { render } from "../src/index.js";

const LABELS = ["built-on", "powered-by"] as const;
const THEMES = ["dark", "light", "auto"] as const;
const SIZES = ["sm", "md", "lg"] as const;

describe("preset snapshots", () => {
  for (const label of LABELS) {
    for (const theme of THEMES) {
      for (const size of SIZES) {
        const name = `${label}-${theme}-${size}`;
        it(name, async () => {
          await expect(render({ label, theme, size })).toMatchFileSnapshot(
            `__snapshots__/${name}.svg`,
          );
        });
      }
    }
  }
});
