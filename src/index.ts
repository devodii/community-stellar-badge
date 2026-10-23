export type Label = "built-on" | "powered-by";
export type Theme = "dark" | "light" | "auto";
export type Size = "sm" | "md" | "lg";

export interface BadgeOptions {
  label?: Label;
  theme?: Theme;
  size?: Size;
}
