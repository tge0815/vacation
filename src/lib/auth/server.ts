import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, type Session } from "./session";
import { getUserInFamily } from "../db/repo";

// Vollständige Session (Rolle + evtl. Kind-ID) aus einer API-Anfrage.
export async function sessionFrom(req: NextRequest): Promise<Session | null> {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

// Session in Server-Komponenten/Seiten (liest cookies() aus next/headers).
export async function sessionFromCookies(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

// Familien-ID aus dem Session-Cookie (egal ob Eltern- oder Kind-Login).
export async function familyIdFrom(req: NextRequest): Promise<number | null> {
  return (await sessionFrom(req))?.familyId ?? null;
}

export async function familyIdFromCookies(): Promise<number | null> {
  return (await sessionFromCookies())?.familyId ?? null;
}

// Standard-Antworten.
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
}

// Nur Eltern (Verwaltung: Kinder, Ziele, Themen, Vokabel-Import, Coach, PIN).
// Gibt die familyId zurück oder eine fertige Fehler-Antwort (401/403).
export async function requireParent(req: NextRequest): Promise<number | NextResponse> {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  if (s.role !== "parent") return forbidden();
  return s.familyId;
}

// Prüft Login UND Zugriff auf ein bestimmtes Kind:
// - Eltern: jedes Kind der eigenen Familie.
// - Kind: ausschließlich das EIGENE Profil.
// Gibt die familyId zurück oder eine fertige Fehler-Antwort (401/403).
export async function authUser(req: NextRequest, userId: number): Promise<number | NextResponse> {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  if (s.role === "child" && userId !== s.userId) return forbidden();
  if (!userId || !getUserInFamily(userId, s.familyId)) return forbidden();
  return s.familyId;
}
