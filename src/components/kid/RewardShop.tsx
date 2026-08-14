"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Clock, Hourglass, Check, X, Gift } from "lucide-react";
import type { PublicUser, PublicRewardPackage, PublicRewardRequest } from "@/lib/serialize";

export function RewardShop({ userId }: { userId: number }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [packages, setPackages] = useState<PublicRewardPackage[] | null>(null);
  const [requests, setRequests] = useState<PublicRewardRequest[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [u, p, r] = await Promise.all([
      fetch(`/api/users/${userId}`).then((x) => x.json()),
      fetch(`/api/rewards/packages`).then((x) => x.json()),
      fetch(`/api/rewards/requests`).then((x) => x.json()),
    ]);
    setUser(u.user ?? null);
    setPackages(p.packages ?? []);
    setRequests(r.requests ?? []);
  }, [userId]);

  useEffect(() => {
    load().catch(() => setPackages([]));
    // Nachladen, damit eine Bestätigung/Ablehnung der Eltern von selbst erscheint.
    const t = setInterval(() => {
      load().catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function request(pkg: PublicRewardPackage) {
    setBusyId(pkg.id);
    setMsg(null);
    try {
      const res = await fetch("/api/rewards/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, packageId: pkg.id }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMsg(d.error ?? "Hat nicht geklappt.");
        return;
      }
      setMsg(`Anfrage für ${pkg.minutes} Min gesendet – warte auf Bestätigung. 🙌`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const coins = user?.coins ?? 0;
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => router.push(`/kind/${userId}`)} className="pill py-2 text-sm">
          <ArrowLeft size={16} /> Zurück
        </button>
        <span className="pill pill-peach py-2 text-sm">🪙 {coins}</span>
      </header>

      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center size-16 rounded-2xl mb-3 border-[2.5px]"
          style={{ background: "var(--dl-sky)", borderColor: "#26242b", color: "#26242b" }}
        >
          <Gift size={30} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Bildschirmzeit</h1>
        <p className="dl-muted mt-1 text-sm font-semibold">
          Tausche deine Coins gegen Bildschirmzeit. Die Coins werden gleich eingesetzt – lehnen
          deine Eltern ab, bekommst du sie zurück.
        </p>
      </div>

      {packages === null ? (
        <div className="flex justify-center py-12 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : packages.length === 0 ? (
        <p className="text-center dl-muted py-8 font-semibold">
          Noch keine Pakete. Deine Eltern legen sie im Eltern-Bereich an.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {packages.map((p) => {
            const affordable = coins >= p.coins;
            return (
              <button
                key={p.id}
                onClick={() => request(p)}
                disabled={!affordable || busyId !== null}
                className={`sticker flex flex-col items-center gap-2 p-5 transition ${
                  affordable ? "hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <Clock size={26} style={{ color: "#26242b" }} />
                <span className="text-2xl font-extrabold">{p.minutes}</span>
                <span className="text-xs dl-muted -mt-1 font-bold">Minuten</span>
                <span className="pill pill-peach mt-1 py-1 px-2.5 text-sm">
                  🪙 {p.coins}
                  {busyId === p.id && <Loader2 className="animate-spin ml-1" size={13} />}
                </span>
                {!affordable && <span className="text-[11px] dl-muted font-bold">noch zu wenig</span>}
              </button>
            );
          })}
        </div>
      )}

      {msg && (
        <p className="text-center text-sm mt-5 text-sky-600 dark:text-sky-400 font-medium">{msg}</p>
      )}

      {/* Offene Anfragen */}
      {pending.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-neutral-500 mb-2">Wartet auf Bestätigung</h2>
          <div className="space-y-2">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3"
              >
                <Hourglass size={18} className="text-amber-500 shrink-0" />
                <span className="flex-1 font-medium">{r.minutes} Min Bildschirmzeit</span>
                <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                  🪙 {r.coins}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verlauf (entschieden) */}
      {requests.some((r) => r.status !== "pending") && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-neutral-500 mb-2">Verlauf</h2>
          <div className="space-y-2">
            {requests
              .filter((r) => r.status !== "pending")
              .slice(0, 8)
              .map((r) => {
                const ok = r.status === "approved";
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] px-4 py-3"
                  >
                    <span
                      className={`shrink-0 inline-flex items-center justify-center size-7 rounded-full ${
                        ok ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
                      }`}
                    >
                      {ok ? <Check size={16} /> : <X size={16} />}
                    </span>
                    <span className="flex-1 font-medium">{r.minutes} Min</span>
                    <span className="text-sm text-neutral-500">
                      {ok ? "bestätigt 🎉" : "abgelehnt"}
                    </span>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </main>
  );
}
