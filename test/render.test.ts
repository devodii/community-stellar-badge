import { describe, expect, it } from "vitest";
import { render, type BadgeOptions } from "../src/index.js";

const DISCLAIMER =
  "This is independent software, not affiliated with, sponsored or endorsed by the Stellar Development Foundation.";

const LABELS = ["built-on", "powered-by"] as const;
const THEMES = ["dark", "light", "auto"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const presets = LABELS.flatMap((label) =>
  THEMES.flatMap((theme) => SIZES.map((size) => ({ label, theme, size }))),
);

// Checks that every tag is closed in order, which is all a string renderer can get wrong.
function isBalanced(svg: string): boolean {
  const stack: string[] = [];
  for (const match of svg.matchAll(/<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = match;
    if (selfClosing) continue;
    if (closing) {
      if (stack.pop() !== name) return false;
    } else if (name) {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

function asOptions(value: unknown): BadgeOptions {
  return value as BadgeOptions;
}

describe("render", () => {
  it("returns a single well formed svg element", () => {
    for (const preset of presets) {
      const svg = render(preset);
      expect(svg.startsWith("<svg ")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(isBalanced(svg)).toBe(true);
    }
  });

  it("is deterministic", () => {
    for (const preset of presets) {
      expect(render(preset)).toBe(render(preset));
    }
  });

  it("never uses text elements, so no font is needed", () => {
    for (const preset of presets) {
      expect(render(preset)).not.toMatch(/<text[\s>]/);
    }
  });

  it("includes an accessible name and the disclaimer", () => {
    for (const preset of presets) {
      const svg = render(preset);
      expect(svg).toContain('role="img"');
      expect(svg).toContain("aria-label=");
      expect(svg).toContain("<title>");
      expect(svg).toContain(DISCLAIMER);
    }
  });

  it("names the label that was asked for", () => {
    expect(render({ label: "built-on" })).toContain('aria-label="Built on Stellar"');
    expect(render({ label: "powered-by" })).toContain('aria-label="Powered by Stellar"');
  });

  it("scales height with size", () => {
    expect(render({ size: "sm" })).toContain('height="20"');
    expect(render({ size: "md" })).toContain('height="28"');
    expect(render({ size: "lg" })).toContain('height="36"');
  });

  it("defaults to built-on, auto and md", () => {
    expect(render()).toBe(render({ label: "built-on", theme: "auto", size: "md" }));
  });

  it("switches colors with the color scheme only for auto", () => {
    expect(render({ theme: "auto" })).toContain("prefers-color-scheme:dark");
    expect(render({ theme: "dark" })).not.toContain("prefers-color-scheme");
    expect(render({ theme: "light" })).not.toContain("prefers-color-scheme");
  });

  it("falls back to the defaults for invalid input", () => {
    const expected = render();
    const bad: unknown[] = [
      undefined,
      null,
      "dark",
      42,
      [],
      {},
      { label: "nope", theme: "nope", size: "nope" },
      { label: 1, theme: {}, size: [] },
      { label: null, theme: undefined, size: NaN },
    ];
    for (const options of bad) {
      expect(render(asOptions(options))).toBe(expected);
    }
  });

  it("keeps valid options when others are invalid", () => {
    const svg = render(asOptions({ label: "powered-by", theme: "bogus", size: "lg" }));
    expect(svg).toBe(render({ label: "powered-by", size: "lg" }));
  });

  it("cannot be used to inject markup", () => {
    const payload = '"><script>alert(1)</script><svg onload="alert(1)"';
    const svg = render(asOptions({ label: payload, theme: payload, size: payload }));
    expect(svg).toBe(render());
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("onload");
  });

  it("does not throw on hostile objects", () => {
    const hostile = {
      get label(): string {
        throw new Error("boom");
      },
    };
    expect(() => render(asOptions(hostile))).not.toThrow();
    expect(render(asOptions(hostile))).toBe(render());
  });
});
