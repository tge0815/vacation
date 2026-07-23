import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type Accent =
  | "blue"
  | "amber"
  | "cyan"
  | "violet"
  | "emerald"
  | "orange"
  | "rose"
  | "pink"
  | "sky";

const accentBg: Record<Accent, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400",
  violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
  pink: "bg-pink-500/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400",
  sky: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
};

type CardProps = {
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
  accent: Accent;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, subtitle, Icon, accent, action, children, className = "" }: CardProps) {
  return (
    <section
      className={`group relative rounded-2xl bg-white dark:bg-[var(--card)] border border-black/[0.06] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-12px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ${className}`}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`size-9 rounded-xl flex items-center justify-center ${accentBg[accent]}`}>
            <Icon size={18} strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold tracking-tight text-[15px] leading-tight">{title}</h2>
            {subtitle && (
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warn" | "danger" | "info";
}) {
  const toneClass = {
    neutral: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${toneClass}`}
    >
      {children}
    </span>
  );
}
