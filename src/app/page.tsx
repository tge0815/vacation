"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Loader2, LogOut } from "lucide-react";
import { color } from "@/components/colors";
import { Star } from "@/components/doodle/Doodles";
import type { PublicUser } from "@/lib/serialize";

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[] | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: { users: PublicUser[] }) => setUsers(d.users))
      .catch(() => setUsers([]));
  }, []);

  function pick(u: PublicUser) {
    router.push(`/kind/${u.id}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  }

  return (
    <main className="relative mx-auto w-full max-w-4xl px-4 py-10 flex-1">
      <div className="flex justify-end mb-2">
        <button onClick={logout} className="pill py-2 text-sm">
          <LogOut size={16} /> Abmelden
        </button>
      </div>
      <header className="text-center mb-10">
        <span className="font-extrabold tracking-tight text-lg">🦊 Lerncoach</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Wer übt heute?</h1>
        <p className="dl-muted mt-2">Tippe auf ein Kind, um seinen Bereich zu öffnen.</p>
      </header>

      {users === null ? (
        <div className="flex justify-center py-20 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {users.map((u) => {
            const c = color(u.color);
            return (
              <button
                key={u.id}
                onClick={() => pick(u)}
                className="sticker group flex flex-col items-center gap-3 p-6 hover:-translate-y-1 transition"
              >
                <span
                  className={`size-20 rounded-full ${c.soft} flex items-center justify-center text-4xl border-[2.5px] group-hover:scale-105 transition`}
                  style={{ borderColor: "var(--dl-outline)" }}
                >
                  {u.emoji}
                </span>
                <span className="font-extrabold text-lg">{u.name}</span>
                <span className="text-xs font-bold dl-muted">Klasse {u.grade}</span>
              </button>
            );
          })}

          <button
            onClick={() => router.push("/eltern")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-[2.5px] border-dashed p-6 dl-muted hover:-translate-y-1 transition"
            style={{ borderColor: "var(--dl-outline)" }}
          >
            <span
              className="size-20 rounded-full flex items-center justify-center border-[2.5px]"
              style={{ borderColor: "var(--dl-outline)", background: "var(--dl-mint)" }}
            >
              <Settings size={30} style={{ color: "#26242b" }} />
            </span>
            <span className="font-extrabold" style={{ color: "var(--dl-ink)" }}>
              Eltern
            </span>
          </button>
        </div>
      )}

      {users !== null && users.length === 0 && (
        <p className="text-center dl-muted mt-8 flex items-center justify-center gap-1">
          <Star size={18} /> Noch keine Kinder angelegt. Tippe auf{" "}
          <span className="font-bold">Eltern</span>, um zu starten.
        </p>
      )}
    </main>
  );
}
