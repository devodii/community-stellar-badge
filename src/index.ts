import { label as labelData } from "./generated/label.js";
import { logo } from "./generated/logo.js";

export type Label = "built-on" | "powered-by";
export type Theme = "dark" | "light" | "auto";
export type Size = "sm" | "md" | "lg";

export interface BadgeOptions {
  label?: Label;
  theme?: Theme;
  size?: Size;
}

const LABELS: readonly Label[] = ["built-on", "powered-by"];
const THEMES: readonly Theme[] = ["dark", "light", "auto"];
const SIZES: readonly Size[] = ["sm", "md", "lg"];
const HEIGHTS: Record<Size, number> = { sm: 20, md: 28, lg: 36 };

const DEFAULTS = { label: "built-on", theme: "auto", size: "md" } as const;

const COLORS: Record<"dark" | "light", { background: string; border: string; foreground: string }> =
  {
    dark: { background: "#000000", border: "#27272a", foreground: "#ffffff" },
    light: { background: "#ffffff", border: "#d4d4d8", foreground: "#000000" },
  };

const DISCLAIMER =
  "This is independent software, not affiliated with, sponsored or endorsed by the Stellar Development Foundation.";

// Cap height of Inter as a fraction of the font size.
const CAP_HEIGHT = 0.7275;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

// Options come from JavaScript callers too, so a getter that throws must not break render.
function read(options: unknown, key: string): unknown {
  try {
    return typeof options === "object" && options !== null
      ? (options as Record<string, unknown>)[key]
      : undefined;
  } catch {
    return undefined;
  }
}

function num(value: number, digits = 2): string {
  return String(Number(value.toFixed(digits)));
}

export function render(options?: BadgeOptions): string {
  const labelKey = pick(read(options, "label"), LABELS, DEFAULTS.label);
  const theme = pick(read(options, "theme"), THEMES, DEFAULTS.theme);
  const size = pick(read(options, "size"), SIZES, DEFAULTS.size);

  const height = HEIGHTS[size];
  const auto = theme === "auto";
  const colors = COLORS[auto ? "light" : theme];
  const text = labelData.labels[labelKey];

  const padding = height * 0.4;
  const gap = height * 0.3;
  const fontSize = height * 0.4;
  const textScale = fontSize / labelData.fontSize;
  const textWidth = text.width * textScale;
  const baseline = height / 2 + (CAP_HEIGHT * fontSize) / 2;

  const logoHeight = height * 0.46;
  const logoScale = logoHeight / logo.height;
  const logoWidth = logo.width * logoScale;
  const logoX = padding + textWidth + gap;

  const width = logoX + logoWidth + padding;
  const radius = height * 0.2;

  const logoPaths = logo.paths.map((path) => `<path d="${path.d}"/>`).join("");
  const name = `${text.text} Stellar`;

  // An svg inside <img> cannot read the page theme, but it can see the viewer's color scheme.
  const style = auto
    ? `<style>.bg{fill:${COLORS.light.background};stroke:${COLORS.light.border}}.fg{fill:${COLORS.light.foreground}}@media (prefers-color-scheme:dark){.bg{fill:${COLORS.dark.background};stroke:${COLORS.dark.border}}.fg{fill:${COLORS.dark.foreground}}}</style>`
    : "";
  const bgAttrs = auto ? 'class="bg"' : `fill="${colors.background}" stroke="${colors.border}"`;
  const fgAttrs = auto ? 'class="fg"' : `fill="${colors.foreground}"`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${num(width)}" height="${num(height)}" viewBox="0 0 ${num(width)} ${num(height)}" role="img" aria-label="${name}">`,
    `<title>${name}. ${DISCLAIMER}</title>`,
    style,
    `<rect x="0.5" y="0.5" width="${num(width - 1)}" height="${num(height - 1)}" rx="${num(radius)}" ${bgAttrs}/>`,
    `<g ${fgAttrs}>`,
    `<path transform="translate(${num(padding)} ${num(baseline)}) scale(${num(textScale, 4)})" d="${text.d}"/>`,
    `<g transform="translate(${num(logoX)} ${num((height - logoHeight) / 2)}) scale(${num(logoScale, 4)})">${logoPaths}</g>`,
    `</g>`,
    `</svg>`,
  ].join("");
}
