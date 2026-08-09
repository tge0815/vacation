import { BookText, Calculator, Languages, BookOpen, Globe, BookA, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  BookText,
  Calculator,
  Languages,
  BookOpen,
  Globe,
  BookA,
};

export function subjectIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}
