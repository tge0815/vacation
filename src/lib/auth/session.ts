// Signierte Session-Tokens für den Familien-Login. Nutzt die Web-Crypto-API
// (globalThis.crypto.subtle), damit derselbe Code in Node-Routen UND in der
// Edge-Middleware läuft. Token-Format: "<familyId>.<expiryMs>.<hmacHex>".

export const SESSION_COOKIE = "lf_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 Tage

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

export async function signSession(familyId: number): Promise<string> {
  const exp = Date.now() + TTL_MS;
  const payload = `${familyId}.${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

// Gibt die familyId zurück, wenn das Token gültig und nicht abgelaufen ist.
export async function verifySession(token: string | undefined | null): Promise<number | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [famStr, expStr, sig] = parts;
  const expected = await hmac(`${famStr}.${expStr}`);
  if (!timingSafeEqualStr(sig, expected)) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const familyId = Number(famStr);
  if (!Number.isInteger(familyId) || familyId <= 0) return null;
  return familyId;
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
    // damit der Login auch über http:// im LAN funktioniert. Öffentlich = HTTPS
    // + LEARN_COOKIE_SECURE=1 setzen.
    secure: process.env.LEARN_COOKIE_SECURE === "1",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  };
}
