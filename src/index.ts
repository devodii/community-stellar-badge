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

// Dark is for dark backgrounds, so its content is light, and the other way round.
const COLORS: Record<"dark" | "light", string> = {
  dark: "#ffffff",
  light: "#000000",
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
  const color = COLORS[auto ? "light" : theme];
  const text = labelData.labels[labelKey];

  const gap = height * 0.2;
  const fontSize = height * 0.4;
  const textScale = fontSize / labelData.fontSize;
  const textWidth = text.width * textScale;
  const baseline = height / 2 + (CAP_HEIGHT * fontSize) / 2;

  const logoHeight = height * 0.46;
  const logoScale = logoHeight / logo.height;
  const logoWidth = logo.width * logoScale;
  const logoX = textWidth + gap;

  const width = logoX + logoWidth;

  const logoPaths = logo.paths.map((path) => `<path d="${path.d}"/>`).join("");
  const name = text.text;

  // An svg inside <img> cannot read the page theme, but it can see the viewer's color scheme.
  const style = auto
    ? `<style>.csb-fg{fill:${COLORS.light}}@media (prefers-color-scheme:dark){.csb-fg{fill:${COLORS.dark}}}</style>`
    : "";
  const fgAttrs = auto ? 'class="csb-fg"' : `fill="${color}"`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${num(width)}" height="${num(height)}" viewBox="0 0 ${num(width)} ${num(height)}" role="img" aria-label="${name}">`,
    `<title>${name}. ${DISCLAIMER}</title>`,
    style,
    `<g ${fgAttrs}>`,
    `<path transform="translate(0 ${num(baseline)}) scale(${num(textScale, 4)})" d="${text.d}"/>`,
    `<g transform="translate(${num(logoX)} ${num((height - logoHeight) / 2)}) scale(${num(logoScale, 4)})">${logoPaths}</g>`,
    `</g>`,
    `</svg>`,
  ].join("");
}
