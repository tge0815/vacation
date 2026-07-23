"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Settings, Loader2 } from "lucide-react";
import { PinPad } from "@/components/PinPad";
import { color } from "@/components/colors";
import type { PublicUser } from "@/lib/serialize";

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[] | null>(null);
  const [pinFor, setPinFor] = useState<PublicUser | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: { users: PublicUser[] }) => setUsers(d.users))
      .catch(() => setUsers([]));
  }, []);

  function pick(u: PublicUser) {
    if (u.hasPin) {
      setPinError(null);
      setPinFor(u);
    } else {
      router.push(`/kind/${u.id}`);
    }
  }

  async function submitPin(pin: string) {
    if (!pinFor) return;
    const res = await fetch(`/api/users/${pinFor.id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const d = (await res.json()) as { ok: boolean };
    if (d.ok) router.push(`/kind/${pinFor.id}`);
    else setPinError("PIN stimmt nicht. Nochmal!");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 flex-1">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-sky-500 mb-2">
          <GraduationCap size={28} />
          <span className="font-semibold tracking-tight">Ferien-Lerncoach</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Wer übt heute?</h1>
        <p className="text-neutral-500 mt-2">Wähle dein Profil aus.</p>
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
                className="group flex flex-col items-center gap-3 rounded-3xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6 hover:shadow-xl hover:-translate-y-1 transition"
              >
                <span
                  className={`size-20 rounded-full ${c.soft} flex items-center justify-center text-4xl group-hover:scale-105 transition`}
                >
                  {u.emoji}
                </span>
                <span className="font-semibold text-lg">{u.name}</span>
                <span className={`text-xs font-medium ${c.text}`}>Klasse {u.grade}</span>
              </button>
            );
          })}

          <button
            onClick={() => router.push("/eltern")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
          >
            <span className="size-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Settings size={30} />
            </span>
            <span className="font-semibold">Eltern</span>
          </button>
        </div>
      )}

      {users !== null && users.length === 0 && (
        <p className="text-center text-neutral-500 mt-8">
          Noch keine Kinder angelegt. Tippe auf <span className="font-semibold">Eltern</span>, um zu
          starten.
        </p>
      )}

      {pinFor && (
        <PinPad
          title={`PIN für ${pinFor.name}`}
          onSubmit={submitPin}
          onCancel={() => setPinFor(null)}
          error={pinError}
        />
      )}
    </main>
  );
}
