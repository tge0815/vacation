"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Loader2,
  Users,
  Ticket,
  Trash2,
  Ban,
  Copy,
  Check,
  Plus,
  Clock,
} from "lucide-react";

type FamilyStat = {
  id: number;
  name: string;
  email: string;
  kids: number;
  lastLogin: number | null;
  createdAt: number;
};

type InviteCode = {
  id: number;
  code: string;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: number | null;
  revoked: number;
  created_at: number;
};

function fmtDate(ms: number | null): string {
  if (!ms) return "–";
  return new Date(ms).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function codeStatus(c: InviteCode): { label: string; cls: string } {
  if (c.revoked) return { label: "Widerrufen", cls: "bg-neutral-400/20 text-neutral-500" };
  if (c.expires_at != null && c.expires_at < Date.now())
    return { label: "Abgelaufen", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" };
  if (c.max_uses != null && c.used_count >= c.max_uses)
    return { label: "Aufgebraucht", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" };
  return { label: "Aktiv", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" };
}

export function AdminArea() {
  const router = useRouter();
  const [families, setFamilies] = useState<FamilyStat[] | null>(null);
  const [codes, setCodes] = useState<InviteCode[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // Formular für neuen Code
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresDays, setExpiresDays] = useState("");
  const [creating, setCreating] = useState(false);

  const loadFamilies = useCallback(() => {
    fetch("/api/admin/families")
      .then((r) => r.json())
      .then((d: { families: FamilyStat[] }) => setFamilies(d.families ?? []))
      .catch(() => setFamilies([]));
  }, []);
  const loadCodes = useCallback(() => {
    fetch("/api/admin/invites")
      .then((r) => r.json())
      .then((d: { codes: InviteCode[] }) => setCodes(d.codes ?? []))
      .catch(() => setCodes([]));
  }, []);

  useEffect(() => {
    loadFamilies();
    loadCodes();
  }, [loadFamilies, loadCodes]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  async function createCode() {
    if (creating) return;
    setCreating(true);
    try {
      const r = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim() || null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresDays: expiresDays ? Number(expiresDays) : null,
        }),
      });
      const d = (await r.json()) as { code?: InviteCode };
      if (d.code) {
        setCodes((prev) => [d.code!, ...(prev ?? [])]);
        setLabel("");
        setMaxUses("");
        setExpiresDays("");
        copyCode(d.code);
      }
    } finally {
      setCreating(false);
    }
  }

  async function copyCode(c: InviteCode) {
    try {
      await navigator.clipboard.writeText(c.code);
      setCopied(c.id);
      setTimeout(() => setCopied((v) => (v === c.id ? null : v)), 1500);
    } catch {
      // Clipboard evtl. nicht verfügbar – kein kritischer Fehler.
    }
  }

  async function revokeCode(id: number) {
    await fetch(`/api/admin/invites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke" }),
    }).catch(() => {});
    loadCodes();
  }

  async function deleteCode(id: number) {
    if (!confirm("Diesen Code endgültig löschen?")) return;
    await fetch(`/api/admin/invites/${id}`, { method: "DELETE" }).catch(() => {});
    loadCodes();
  }

  async function deleteFamily(f: FamilyStat) {
    if (
      !confirm(
        `Familie „${f.name}" (${f.email}) mit ${f.kids} Kind(ern) und ALLEN Lerndaten unwiderruflich löschen?`,
      )
    )
      return;
    await fetch(`/api/admin/families/${f.id}`, { method: "DELETE" }).catch(() => {});
    loadFamilies();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold">🛠️ Admin</h1>
        <button onClick={logout} className="pill pill-sm">
          <LogOut size={15} /> Abmelden
        </button>
      </header>

      {/* Familien */}
      <section className="mb-10">
        <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
          <Users size={20} /> Familien
          {families && <span className="dl-muted text-sm font-bold">· {families.length}</span>}
        </h2>
        {!families ? (
          <div className="flex justify-center py-10 text-neutral-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : families.length === 0 ? (
          <p className="dl-muted font-semibold">Noch keine Familien angelegt.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {families.map((f) => (
              <div key={f.id} className="sticker p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold truncate">{f.name}</div>
                  <div className="text-sm dl-muted font-semibold truncate">{f.email}</div>
                  <div className="text-xs dl-muted font-semibold mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>👧 {f.kids} Kinder</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> zuletzt: {f.lastLogin ? fmtDate(f.lastLogin) : "nie"}
                    </span>
                    <span>angelegt: {fmtDate(f.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteFamily(f)}
                  className="pill pill-sm shrink-0"
                  title="Familie löschen"
                  style={{ background: "var(--dl-pink)", color: "#26242b" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Einladungscodes */}
      <section>
        <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2">
          <Ticket size={20} /> Einladungscodes
        </h2>

        {/* Neuer Code */}
        <div className="sticker p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            <label className="flex flex-col gap-1 sm:col-span-3">
              <span className="text-xs font-bold dl-muted">Notiz (für wen?)</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="z.B. Familie Müller"
                className="rounded-xl border-[2.5px] px-3 py-2 font-semibold focus:outline-none"
                style={{ borderColor: "var(--dl-outline)", background: "var(--dl-paper)" }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold dl-muted">Max. Nutzungen (leer = ∞)</span>
              <input
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="1"
                className="rounded-xl border-[2.5px] px-3 py-2 font-semibold focus:outline-none"
                style={{ borderColor: "var(--dl-outline)", background: "var(--dl-paper)" }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold dl-muted">Gültig für Tage (leer = ∞)</span>
              <input
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="30"
                className="rounded-xl border-[2.5px] px-3 py-2 font-semibold focus:outline-none"
                style={{ borderColor: "var(--dl-outline)", background: "var(--dl-paper)" }}
              />
            </label>
          </div>
          <button onClick={createCode} disabled={creating} className="pill pill-peach w-full py-3">
            {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Code erstellen
          </button>
        </div>

        {/* Liste */}
        {!codes ? (
          <div className="flex justify-center py-10 text-neutral-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <p className="dl-muted font-semibold">Noch keine Codes. Erstelle oben deinen ersten.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {codes.map((c) => {
              const st = codeStatus(c);
              return (
                <div key={c.id} className="sticker p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-extrabold text-lg tracking-wide">{c.code}</span>
                    <button
                      onClick={() => copyCode(c)}
                      className="pill pill-sm"
                      title="Code kopieren"
                    >
                      {copied === c.id ? <Check size={14} /> : <Copy size={14} />}
                      {copied === c.id ? "kopiert" : "kopieren"}
                    </button>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="text-xs dl-muted font-semibold mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                    {c.label && <span>📝 {c.label}</span>}
                    <span>
                      Nutzungen: {c.used_count}
                      {c.max_uses != null ? ` / ${c.max_uses}` : " / ∞"}
                    </span>
                    <span>läuft ab: {c.expires_at ? fmtDate(c.expires_at) : "nie"}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {!c.revoked && (
                      <button onClick={() => revokeCode(c.id)} className="pill pill-sm">
                        <Ban size={14} /> Widerrufen
                      </button>
                    )}
                    <button
                      onClick={() => deleteCode(c.id)}
                      className="pill pill-sm"
                      style={{ background: "var(--dl-pink)", color: "#26242b" }}
                    >
                      <Trash2 size={14} /> Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
