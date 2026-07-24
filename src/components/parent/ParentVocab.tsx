"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { color } from "@/components/colors";
import type { PublicUser } from "@/lib/serialize";

type Vocab = {
  id: number;
  prompt: string;
  answer: string;
  seen: number;
  correct: number;
  wrong: number;
  box: number;
};

export function ParentVocab() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [data, setData] = useState<{ forUser: number; vocab: Vocab[] } | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: { users: PublicUser[] }) => {
        setUsers(d.users);
        if (d.users[0]) setUserId(d.users[0].id);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/vocab?userId=${userId}`)
      .then((r) => r.json())
      .then((d: { vocab: Vocab[] }) => setData({ forUser: userId, vocab: d.vocab }))
      .catch(() => setData({ forUser: userId, vocab: [] }));
  }, [userId]);

  const vocab = data && data.forUser === userId ? data.vocab : null;

  if (users.length === 0)
    return <p className="text-neutral-500 text-center py-8">Erst ein Kind anlegen.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setUserId(u.id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              userId === u.id ? `${color(u.color).bg} text-white` : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <span>{u.emoji}</span> {u.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        Abgefragte Vokabeln. Falsche kommen automatisch wieder dran, bis sie sitzen — Status wird nach
        mehrmals richtig zu „gelernt“.
      </p>

      {!vocab ? (
        <div className="flex justify-center py-12 text-neutral-400">
          <Loader2 className="animate-spin" />
        </div>
      ) : vocab.length === 0 ? (
        <p className="text-neutral-500 text-center py-8">
          Noch keine Vokabeln geübt. Sobald das Kind Englisch-Vokabeln macht, erscheinen sie hier.
        </p>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-black/[0.06] dark:border-white/[0.06] divide-y divide-black/[0.05] dark:divide-white/[0.05]">
          {vocab.map((v) => {
            const learned = v.box >= 5;
            return (
              <div key={v.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.prompt}</div>
                  <div className="text-xs text-neutral-500 truncate">→ {v.answer}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-500 nums" title="richtig">
                  <Check size={13} /> {v.correct}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-rose-500 nums" title="falsch">
                  <X size={13} /> {v.wrong}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    learned
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {learned ? "gelernt" : `übt (${v.box}/5)`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
