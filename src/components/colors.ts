// Feste Tailwind-Klassen pro Farbname (Tailwind kann keine dynamischen Strings purgen).

export type ColorName =
  | "sky"
  | "rose"
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "orange"
  | "pink"
  | "cyan";

export const COLOR_NAMES: ColorName[] = [
  "sky",
  "rose",
  "blue",
  "emerald",
  "violet",
  "amber",
  "orange",
  "pink",
  "cyan",
];

type ColorClasses = {
  bg: string; // kräftiger Hintergrund (Buttons/Tiles)
  soft: string; // weicher Hintergrund
  text: string; // Textfarbe
  ring: string; // Stroke-Farbe (currentColor über text)
  border: string;
};

export const COLOR_MAP: Record<ColorName, ColorClasses> = {
  sky: { bg: "bg-sky-500", soft: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", ring: "text-sky-500", border: "border-sky-500/30" },
  rose: { bg: "bg-rose-500", soft: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", ring: "text-rose-500", border: "border-rose-500/30" },
  blue: { bg: "bg-blue-500", soft: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", ring: "text-blue-500", border: "border-blue-500/30" },
  emerald: { bg: "bg-emerald-500", soft: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "text-emerald-500", border: "border-emerald-500/30" },
  violet: { bg: "bg-violet-500", soft: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", ring: "text-violet-500", border: "border-violet-500/30" },
  amber: { bg: "bg-amber-500", soft: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "text-amber-500", border: "border-amber-500/30" },
  orange: { bg: "bg-orange-500", soft: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", ring: "text-orange-500", border: "border-orange-500/30" },
  pink: { bg: "bg-pink-500", soft: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", ring: "text-pink-500", border: "border-pink-500/30" },
  cyan: { bg: "bg-cyan-500", soft: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", ring: "text-cyan-500", border: "border-cyan-500/30" },
};

export function color(name: string): ColorClasses {
  return COLOR_MAP[(name as ColorName)] ?? COLOR_MAP.sky;
}
