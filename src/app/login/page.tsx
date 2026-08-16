"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandMascot } from "@/components/BrandMascot";
import { Squiggle, Star } from "@/components/doodle/Doodles";

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
    <main className="relative mx-auto w-full max-w-sm px-4 py-14 flex-1">
      <Star className="absolute top-24 left-1" size={26} />

      <div className="text-center mb-7">
        <BrandMascot size={160} className="mx-auto drop-shadow-sm" />
        <span className="block text-2xl font-extrabold tracking-tight" style={{ color: "var(--dl-ink)" }}>
          Lerncoach
        </span>
        <h1 className="text-xl font-bold mt-2">Anmelden</h1>
        <p className="text-sm dl-muted mt-1">Bereit zum Üben? Los geht&apos;s! 🚀</p>
      </div>

      <form onSubmit={submit} className="sticker flex flex-col gap-3 p-6 relative">
        <Squiggle className="absolute -left-12 top-8 hidden sm:block" size={70} />
        <label className="text-sm font-bold">E-Mail (Eltern) oder Benutzername (Kind)</label>
        <input
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="rounded-2xl border-[2.5px] px-4 py-2.5 bg-transparent focus:outline-none"
          style={{ borderColor: "var(--dl-outline)" }}
        />
        <label className="text-sm font-bold mt-1">Passwort</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-2xl border-[2.5px] px-4 py-2.5 bg-transparent focus:outline-none"
          style={{ borderColor: "var(--dl-outline)" }}
        />
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <button type="submit" disabled={busy || !identifier || !password} className="pill pill-peach mt-2 py-2.5 text-base">
          {busy ? <Loader2 className="animate-spin" size={18} /> : null}
          Anmelden
        </button>
      </form>

      <p className="text-center text-sm dl-muted mt-5">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-bold underline" style={{ color: "var(--dl-ink)" }}>
          Familie registrieren
        </Link>
      </p>
    </main>
  );
}
