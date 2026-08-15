// Signierte Session-Tokens. Nutzt die Web-Crypto-API (crypto.subtle), damit
// derselbe Code in Node-Routen UND im Edge-Proxy läuft.
//
// Token trägt jetzt die Rolle mit:
//   Eltern:  "<familyId>.p.0.<expiryMs>.<hmac>"
//   Kind:    "<familyId>.k.<userId>.<expiryMs>.<hmac>"
// Alte Tokens "<familyId>.<expiryMs>.<hmac>" gelten weiter als Eltern-Login
// (kein Zwangs-Logout beim Update).

export const SESSION_COOKIE = "lf_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 Tage

export type SessionRole = "parent" | "child" | "admin";
export type Session = { familyId: number; role: SessionRole; userId: number };

function secret(): string {
  return process.env.LEARN_SESSION_SECRET ?? "lernferien-dev-secret-bitte-setzen";
}

const enc = new TextEncoder();

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function expValid(expStr: string): boolean {
  const exp = Number(expStr);
  return Number.isFinite(exp) && exp >= Date.now();
}
function posInt(n: number): boolean {
  return Number.isInteger(n) && n > 0;
}

export async function signSession(
  familyId: number,
  role: SessionRole = "parent",
  userId = 0,
): Promise<string> {
  const exp = Date.now() + TTL_MS;
  const r = role === "child" ? "k" : role === "admin" ? "a" : "p";
  const payload = `${familyId}.${r}.${userId}.${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

// Gibt die Session zurück, wenn das Token gültig und nicht abgelaufen ist.
export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const parts = token.split(".");

  // Neues Format: familyId.role.userId.exp.sig
  if (parts.length === 5) {
    const [famStr, r, uidStr, expStr, sig] = parts;
    const expected = await hmac(`${famStr}.${r}.${uidStr}.${expStr}`);
    if (!timingSafeEqualStr(sig, expected)) return null;
    if (!expValid(expStr)) return null;
    if (r !== "p" && r !== "k" && r !== "a") return null;
    const familyId = Number(famStr);
    const userId = Number(uidStr);
    // Admin gehört zu keiner Familie (familyId 0), braucht aber eine userId.
    if (r === "a") {
      if (!posInt(userId)) return null;
      return { familyId: 0, role: "admin", userId };
    }
    if (!posInt(familyId)) return null;
    if (r === "k" && !posInt(userId)) return null;
    return { familyId, role: r === "k" ? "child" : "parent", userId: r === "k" ? userId : 0 };
  }

  // Alt-Format (Eltern): familyId.exp.sig
  if (parts.length === 3) {
    const [famStr, expStr, sig] = parts;
    const expected = await hmac(`${famStr}.${expStr}`);
    if (!timingSafeEqualStr(sig, expected)) return null;
    if (!expValid(expStr)) return null;
    const familyId = Number(famStr);
    if (!posInt(familyId)) return null;
    return { familyId, role: "parent", userId: 0 };
  }

  return null;
}

export function sessionCookie(value: string): {
  name: string;
  value: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    // Secure-Cookie nur wenn hinter HTTPS (LEARN_COOKIE_SECURE=1). Standard aus,
    // damit der Login auch über http:// im LAN funktioniert.
    secure: process.env.LEARN_COOKIE_SECURE === "1",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  };
}
