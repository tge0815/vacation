import { BookText, Calculator, Languages, BookOpen, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  BookText,
  Calculator,
  Languages,
  BookOpen,
};

export function subjectIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}
