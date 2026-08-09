import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./session";
import { getUserInFamily } from "../db/repo";

// Familien-ID aus dem Session-Cookie einer API-Anfrage (NextRequest).
export async function familyIdFrom(req: NextRequest): Promise<number | null> {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value);
}

// Familien-ID in Server-Komponenten/Seiten (liest cookies() aus next/headers).
export async function familyIdFromCookies(): Promise<number | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

// Standard-Antwort für nicht angemeldete API-Zugriffe.
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
}

// Prüft Login UND dass das Kind (userId) zur angemeldeten Familie gehört.
// Gibt die familyId zurück oder eine fertige Fehler-Antwort (401/403).
export async function authUser(req: NextRequest, userId: number): Promise<number | NextResponse> {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  if (!userId || !getUserInFamily(userId, familyId)) return forbidden();
  return familyId;
}
