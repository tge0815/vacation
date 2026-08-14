"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { color } from "@/components/colors";
import { subjectIcon } from "@/components/subjectIcon";

type Stage = {
  id: string;
  kind: "exercise" | "game" | "map";
  subjectName: string;
  icon: string;
  color: string;
  label: string;
  chip: string;
  reason: "weak" | "due" | "goal" | "variety";
  required: boolean;
  done: boolean;
  href: string;
};

type PathData = { stages: Stage[]; allRequiredDone: boolean; streak: number };

const REASON_STYLE: Record<Stage["reason"], string> = {
  weak: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  due: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  goal: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  variety: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export function KidPath({ userId }: { userId: number }) {
  const router = useRouter();
  const [data, setData] = useState<PathData | null>(null);

  useEffect(() => {
    fetch(`/api/path?userId=${userId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ stages: [], allRequiredDone: false, streak: 0 }));
  }, [userId]);

  if (!data) {
    return (
      <div className="flex justify-center py-8 text-neutral-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (data.stages.length === 0) return null;

  // Der Fuchs steht an der ersten noch offenen Pflicht-Etappe.
  const currentId = data.stages.find((s) => s.required && !s.done)?.id;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold">🦊 Dein Weg heute</h2>
        {data.allRequiredDone && (
          <span className="pill pill-sm pill-mint">🎉 geschafft!</span>
        )}
      </div>
      <p className="dl-muted text-sm font-semibold mb-4 -mt-2">
        Der Fuchs schlägt dir eine Reihenfolge vor – du darfst aber frei wählen, wo du anfängst.
      </p>

      <div className="relative">
        {data.stages.map((s, i) => {
          const c = color(s.color);
          const Icon = s.kind === "exercise" ? subjectIcon(s.icon) : null;
          const isCurrent = s.id === currentId;
          return (
            <div key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
              {/* Verbindungslinie */}
              {i < data.stages.length - 1 && (
                <span
                  className="absolute left-[23px] top-12 bottom-0 border-l-[3px] border-dashed"
                  style={{ borderColor: "var(--dl-outline)", opacity: 0.35 }}
                />
              )}
              {/* Etappen-Knoten */}
              <div className="relative shrink-0">
                <span
                  className={`size-12 rounded-full flex items-center justify-center text-xl border-[2.5px] ${
                    s.done ? "" : c.soft
                  }`}
                  style={{
                    borderColor: "var(--dl-outline)",
                    boxShadow: "3px 3px 0 var(--dl-shadow)",
                    background: s.done ? "#bff0d4" : undefined,
                  }}
                >
                  {s.done ? (
                    <Check size={22} className="text-emerald-600" />
                  ) : Icon ? (
                    <Icon size={22} className={c.text} />
                  ) : (
                    <span>{s.icon}</span>
                  )}
                </span>
                {isCurrent && (
                  <span className="absolute -top-3 -right-2 text-lg drop-shadow" title="Du bist hier">
                    🦊
                  </span>
                )}
              </div>

              {/* Etappen-Karte */}
              <button
                onClick={() => router.push(s.href)}
                className={`sticker flex-1 flex items-center gap-2 p-3 text-left transition ${
                  s.done ? "opacity-70" : "hover:-translate-y-0.5"
                } ${isCurrent ? "ring-2 ring-offset-2" : ""}`}
                style={isCurrent ? { boxShadow: "5px 5px 0 var(--dl-shadow)" } : undefined}
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-bold truncate">{s.label}</span>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${REASON_STYLE[s.reason]}`}>
                    {s.chip}
                  </span>
                </span>
                {!s.done && <span className="text-lg dl-muted">›</span>}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
