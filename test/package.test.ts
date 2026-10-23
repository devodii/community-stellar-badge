import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";

interface PackResult {
  files: { path: string }[];
}

let paths: string[] = [];

describe("npm package", () => {
  beforeAll(() => {
    execFileSync("pnpm", ["build"], { stdio: "ignore" });
    const output = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      encoding: "utf8",
    });
    const [result] = JSON.parse(output) as PackResult[];
    paths = (result?.files ?? []).map((file) => file.path);
  }, 120_000);

  it("ships the built library", () => {
    expect(paths).toContain("dist/index.js");
    expect(paths).toContain("dist/index.cjs");
    expect(paths).toContain("dist/index.d.ts");
  });

  it("ships every badge", () => {
    const badges = paths.filter((path) => path.startsWith("badges/"));
    expect(badges).toHaveLength(3);
    expect(paths).toContain("badges/dark.svg");
    expect(paths).toContain("badges/light.svg");
    expect(paths).toContain("badges/auto.svg");
  });

  it("does not ship sources or generated scripts", () => {
    expect(paths.some((path) => path.startsWith("src/"))).toBe(false);
    expect(paths.some((path) => path.startsWith("scripts/"))).toBe(false);
  });
});
