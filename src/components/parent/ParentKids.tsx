"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Loader2, KeyRound, UserCircle2 } from "lucide-react";
import { COLOR_NAMES, color } from "@/components/colors";
import type { PublicUser } from "@/lib/serialize";

const EMOJIS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🐙", "🦄", "🐝", "🦖", "🐬", "🦉", "🦆", "🐰", "🚀", "⚽", "🎨", "🎸"];

type Draft = {
  name: string;
  emoji: string;
  colorName: string;
  grade: number;
  username: string;
  password: string;
};
const emptyDraft = (): Draft => ({
  name: "",
  emoji: "🦊",
  colorName: "sky",
  grade: 5,
  username: "",
  password: "",
});

export function ParentKids() {
  const [users, setUsers] = useState<PublicUser[] | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const d = (await (await fetch("/api/users")).json()) as { users: PublicUser[] };
    setUsers(d.users);
  }
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: { users: PublicUser[] }) => setUsers(d.users))
      .catch(() => setUsers([]));
  }, []);

  function startNew() {
    setError(null);
    setDraft(emptyDraft());
    setEditing("new");
  }
  function startEdit(u: PublicUser) {
    setError(null);
    setDraft({
      name: u.name,
      emoji: u.emoji,
      colorName: u.color,
      grade: u.grade,
      username: u.username ?? "",
      password: "",
    });
    setEditing(u.id);
  }

  async function save() {
    if (!draft.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const isNew = editing === "new";
      const url = isNew ? "/api/users" : `/api/users/${editing}`;
      const method = isNew ? "POST" : "PATCH";
      const payload: Record<string, unknown> = {
        name: draft.name,
        emoji: draft.emoji,
        color: draft.colorName,
        grade: draft.grade,
        // Benutzername immer mitsenden (leer = Login entfernen).
        username: draft.username.trim() || null,
      };
      // Passwort nur senden, wenn eingegeben (leer = unverändert lassen).
      if (draft.password) payload.password = draft.password;
      // Beim Neuanlegen mit Benutzername ist ein Passwort nötig.
      if (isNew && draft.username.trim() && !draft.password) {
        setError("Für den Login bitte auch ein Passwort vergeben.");
        setBusy(false);
        return;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Speichern fehlgeschlagen");
        setBusy(false);
        return;
      }
      setEditing(null);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Dieses Kind und alle seine Übungen wirklich löschen?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await reload();
  }

  if (users === null)
    return (
      <div className="flex justify-center py-12 text-neutral-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4">
      {users.map((u) => {
        const c = color(u.color);
        if (editing === u.id)
          return (
            <Editor
              key={u.id}
              draft={draft}
              setDraft={setDraft}
              onSave={save}
              onCancel={() => setEditing(null)}
              busy={busy}
              error={error}
              isNew={false}
            />
          );
        return (
          <div
            key={u.id}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] p-4"
          >
            <span className={`size-12 rounded-full ${c.soft} flex items-center justify-center text-2xl`}>
              {u.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{u.name}</div>
              <div className="text-xs text-neutral-500 flex items-center gap-1.5 flex-wrap">
                <span>Klasse {u.grade}</span>
                {u.hasLogin ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <UserCircle2 size={12} /> {u.username}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <KeyRound size={12} /> kein Login
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => startEdit(u)} className="text-neutral-400 hover:text-sky-500 p-2">
              <Pencil size={18} />
            </button>
            <button onClick={() => remove(u.id)} className="text-neutral-400 hover:text-rose-500 p-2">
              <Trash2 size={18} />
            </button>
          </div>
        );
      })}

      {editing === "new" ? (
        <Editor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={() => setEditing(null)}
          busy={busy}
          error={error}
          isNew
        />
      ) : (
        <button
          onClick={startNew}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 py-3 font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          <Plus size={18} /> Kind hinzufügen
        </button>
      )}

      <ParentPinSetting />
    </div>
  );
}

function Editor({
  draft,
  setDraft,
  onSave,
  onCancel,
  busy,
  error,
  isNew,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
  error: string | null;
  isNew: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border-2 border-sky-500/40 p-4 space-y-4">
      <input
        autoFocus
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="Name"
        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 text-lg font-medium focus:border-sky-500 focus:outline-none"
      />

      <div>
        <div className="text-xs font-medium text-neutral-500 mb-1.5">Avatar</div>
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setDraft({ ...draft, emoji: e })}
              className={`size-10 rounded-lg text-xl flex items-center justify-center ${
                draft.emoji === e ? "bg-sky-500/20 ring-2 ring-sky-500" : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-neutral-500 mb-1.5">Farbe</div>
        <div className="flex flex-wrap gap-2">
          {COLOR_NAMES.map((cn) => (
            <button
              key={cn}
              onClick={() => setDraft({ ...draft, colorName: cn })}
              className={`size-8 rounded-full ${color(cn).bg} ${
                draft.colorName === cn ? "ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-900" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="text-xs font-medium text-neutral-500">Klasse</span>
        <input
          type="number"
          min={1}
          max={13}
          value={draft.grade}
          onChange={(e) => setDraft({ ...draft, grade: Number(e.target.value) })}
          className="w-full mt-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
        />
      </label>

      {/* Kind-Login (vom Elternteil vergeben) */}
      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 p-3 space-y-2">
        <div className="text-xs font-medium text-neutral-500">
          Login fürs Kind (damit es sich selbst anmelden kann)
        </div>
        <div className="flex gap-3 flex-wrap">
          <label className="flex-1 min-w-[140px] text-sm">
            <span className="text-xs text-neutral-500">Benutzername</span>
            <input
              autoCapitalize="none"
              value={draft.username}
              onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/\s/g, "") })}
              placeholder="z.B. max"
              className="w-full mt-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          </label>
          <label className="flex-1 min-w-[140px] text-sm">
            <span className="text-xs text-neutral-500">
              Passwort {isNew ? "" : "(leer = unverändert)"}
            </span>
            <input
              type="text"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              placeholder={isNew ? "mind. 4 Zeichen" : "••••"}
              className="w-full mt-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          </label>
        </div>
        <p className="text-[11px] text-neutral-400">
          Benutzername leeren = Login entfernen. Passwort ist im Klartext sichtbar, damit du es dem
          Kind sagen kannst.
        </p>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X size={16} /> Abbrechen
        </button>
        <button
          onClick={onSave}
          disabled={busy || !draft.name.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 text-white px-4 py-2 font-semibold disabled:opacity-40 hover:opacity-90"
        >
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Speichern
        </button>
      </div>
    </div>
  );
}

function ParentPinSetting() {
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function reload() {
    const d = (await (await fetch("/api/parent")).json()) as { pinSet: boolean };
    setPinSet(d.pinSet);
  }
  useEffect(() => {
    fetch("/api/parent")
      .then((r) => r.json())
      .then((d: { pinSet: boolean }) => setPinSet(d.pinSet))
      .catch(() => {});
  }, []);

  async function save() {
    setMsg(null);
    const res = await fetch("/api/parent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set", pin: current, newPin: next || null }),
    });
    const d = (await res.json()) as { ok: boolean; error?: string };
    if (d.ok) {
      setMsg(next ? "PIN gesetzt." : "PIN entfernt.");
      setCurrent("");
      setNext("");
      setOpen(false);
      reload();
    } else {
      setMsg(d.error ?? "Fehler");
    }
  }

  return (
    <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-black/[0.06] dark:border-white/[0.06] p-4 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <KeyRound size={16} className="text-amber-500" />
          Eltern-PIN {pinSet ? "aktiv" : "nicht gesetzt"}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="text-sm text-sky-500 font-medium">
          {open ? "Schließen" : "Ändern"}
        </button>
      </div>
      <p className="text-[11px] text-neutral-400 mt-1">
        Zusätzlicher Schutz für den Eltern-Bereich (zusätzlich zum Eltern-Login).
      </p>
      {open && (
        <div className="mt-3 space-y-2">
          {pinSet && (
            <input
              inputMode="numeric"
              maxLength={4}
              value={current}
              onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ""))}
              placeholder="Aktueller PIN"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
            />
          )}
          <input
            inputMode="numeric"
            maxLength={4}
            value={next}
            onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))}
            placeholder="Neuer PIN (leer = entfernen)"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 py-2 focus:border-sky-500 focus:outline-none"
          />
          <button onClick={save} className="w-full rounded-xl bg-sky-500 text-white py-2 font-semibold hover:opacity-90">
            Speichern
          </button>
        </div>
      )}
      {msg && <p className="text-sm text-neutral-500 mt-2">{msg}</p>}
    </div>
  );
}
