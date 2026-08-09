"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Check, X, Plus, Trash2, Clock, Power } from "lucide-react";
import { color } from "@/components/colors";
import type { PublicRewardPackage, PublicRewardRequest } from "@/lib/serialize";

export function ParentRewards() {
  const [requests, setRequests] = useState<PublicRewardRequest[] | null>(null);
  const [packages, setPackages] = useState<PublicRewardPackage[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [r, p] = await Promise.all([
      fetch("/api/rewards/requests").then((x) => x.json()),
      fetch("/api/rewards/packages?all=1").then((x) => x.json()),
    ]);
    setRequests(r.requests ?? []);
    setPackages(p.packages ?? []);
  }, []);

  useEffect(() => {
    load().catch(() => setRequests([]));
  }, [load]);

  async function decide(id: number, action: "approve" | "decline") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/rewards/requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) setError(d.error ?? "Fehler");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (requests === null)
    return (
      <div className="flex justify-center py-12 text-neutral-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending").slice(0, 12);

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-rose-500">{error}</p>}

      {/* Offene Anfragen */}
      <section>
        <h2 className="font-semibold mb-3">
          Offene Anfragen
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-rose-500 text-white text-xs px-2 py-0.5">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">Keine offenen Anfragen.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((r) => {
              const c = color(r.color ?? "sky");
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-3"
                >
                  <span className={`size-10 rounded-full ${c.soft} flex items-center justify-center text-xl`}>
                    {r.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{r.userName}</div>
                    <div className="text-xs text-neutral-500">
                      {r.minutes} Min Bildschirmzeit · 🪙 {r.coins}
                    </div>
                  </div>
                  <button
                    onClick={() => decide(r.id, "decline")}
                    disabled={busyId === r.id}
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 disabled:opacity-40"
                  >
                    <X size={16} /> Ablehnen
                  </button>
                  <button
                    onClick={() => decide(r.id, "approve")}
                    disabled={busyId === r.id}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 text-white px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                  >
                    {busyId === r.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Bestätigen
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Verlauf */}
      {history.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Verlauf</h2>
          <div className="space-y-2">
            {history.map((r) => {
              const ok = r.status === "approved";
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-black/[0.06] dark:border-white/[0.06] px-4 py-2.5 text-sm"
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <b>{r.userName}</b> · {r.minutes} Min · 🪙 {r.coins}
                  </span>
                  <span className={ok ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                    {ok ? "bestätigt" : "abgelehnt"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pakete verwalten */}
      <section>
        <h2 className="font-semibold mb-1">Pakete</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Lege fest, wie viele Coins wie viele Minuten Bildschirmzeit kosten.
        </p>
        <PackageEditor packages={packages} onChanged={load} />
      </section>
    </div>
  );
}

function PackageEditor({
  packages,
  onChanged,
}: {
  packages: PublicRewardPackage[];
  onChanged: () => Promise<void>;
}) {
  const [newMin, setNewMin] = useState("");
  const [newCoins, setNewCoins] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function patch(id: number, body: Record<string, unknown>) {
    await fetch(`/api/rewards/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await onChanged();
  }

  async function remove(id: number) {
    if (!confirm("Dieses Paket löschen?")) return;
    await fetch(`/api/rewards/packages/${id}`, { method: "DELETE" });
    await onChanged();
  }

  async function add() {
    setErr(null);
    const minutes = Number(newMin);
    const coins = Number(newCoins);
    if (!minutes || !coins) {
      setErr("Bitte Minuten und Coins angeben.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/rewards/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, coins }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(d.error ?? "Fehler");
        return;
      }
      setNewMin("");
      setNewCoins("");
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {packages.map((p) => (
        <div
          key={p.id}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
            p.active
              ? "bg-white dark:bg-neutral-900 border-black/[0.06] dark:border-white/[0.06]"
              : "bg-neutral-100 dark:bg-neutral-900/50 border-transparent opacity-70"
          }`}
        >
          <Clock size={16} className="text-sky-500 shrink-0" />
          <NumField value={p.minutes} suffix="Min" onCommit={(v) => patch(p.id, { minutes: v })} />
          <span className="text-neutral-400">=</span>
          <NumField value={p.coins} suffix="🪙" onCommit={(v) => patch(p.id, { coins: v })} />
          <div className="flex-1" />
          <button
            onClick={() => patch(p.id, { active: !p.active })}
            title={p.active ? "Deaktivieren" : "Aktivieren"}
            className={`p-2 rounded-lg ${p.active ? "text-emerald-500 hover:bg-emerald-500/10" : "text-neutral-400 hover:bg-neutral-500/10"}`}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => remove(p.id)}
            className="p-2 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-2.5">
        <input
          inputMode="numeric"
          value={newMin}
          onChange={(e) => setNewMin(e.target.value.replace(/\D/g, ""))}
          placeholder="Min"
          className="w-16 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-2 py-1.5 text-center focus:border-sky-500 focus:outline-none"
        />
        <span className="text-neutral-400">=</span>
        <input
          inputMode="numeric"
          value={newCoins}
          onChange={(e) => setNewCoins(e.target.value.replace(/\D/g, ""))}
          placeholder="🪙"
          className="w-16 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-2 py-1.5 text-center focus:border-sky-500 focus:outline-none"
        />
        <div className="flex-1" />
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 text-white px-3 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-40"
        >
          {busy ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Paket
        </button>
      </div>
      {err && <p className="text-sm text-rose-500">{err}</p>}
    </div>
  );
}

// Kleines Inline-Zahlenfeld: übernimmt bei Enter oder Verlassen.
function NumField({
  value,
  suffix,
  onCommit,
}: {
  value: number;
  suffix: string;
  onCommit: (v: number) => void;
}) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  function commit() {
    const n = Number(v);
    if (n && n !== value) onCommit(n);
    else setV(String(value));
  }
  return (
    <span className="inline-flex items-center gap-1">
      <input
        inputMode="numeric"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="w-14 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent px-2 py-1.5 text-center focus:border-sky-500 focus:outline-none"
      />
      <span className="text-sm text-neutral-500">{suffix}</span>
    </span>
  );
}
