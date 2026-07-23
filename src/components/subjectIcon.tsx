import { BookText, Calculator, Languages, BookOpen, Globe, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  BookText,
  Calculator,
  Languages,
  BookOpen,
  Globe,
};

export function subjectIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}
