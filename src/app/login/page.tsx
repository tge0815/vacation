"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const d = (await r.json()) as { ok?: boolean; redirect?: string; error?: string };
      if (!r.ok) {
        setError(d.error ?? "Login fehlgeschlagen");
        setBusy(false);
        return;
      }
      router.push(d.redirect ?? "/");
      router.refresh();
    } catch {
      setError("Verbindungsfehler");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16 flex-1">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sky-500 mb-2">
          <GraduationCap size={28} />
          <span className="font-semibold tracking-tight">Ferien-Lerncoach</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Anmelden</h1>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-6"
      >
        <label className="text-sm font-medium">E-Mail (Eltern) oder Benutzername (Kind)</label>
        <input
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 focus:border-sky-500 focus:outline-none"
        />
        <label className="text-sm font-medium mt-1">Passwort</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 focus:border-sky-500 focus:outline-none"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={busy || !identifier || !password}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 text-white font-semibold py-2.5 disabled:opacity-40 hover:opacity-90"
        >
          {busy ? <Loader2 className="animate-spin" size={18} /> : null}
          Anmelden
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-5">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-semibold text-sky-500 hover:underline">
          Familie registrieren
        </Link>
      </p>
    </main>
  );
}
