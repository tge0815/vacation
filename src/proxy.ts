import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/auth/session";

// Öffentlich erreichbare Pfade (ohne Login). Alles andere wird abgeriegelt.
const PUBLIC_PAGES = ["/login", "/register"];
const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/health"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublic = isApi
    ? PUBLIC_API.includes(pathname)
    : PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const familyId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (isPublic) {
    // Bereits angemeldet? Login/Register überspringen → zur Startseite.
    if (familyId && !isApi) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!familyId) {
    if (isApi) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Gate: alles außer Next-Assets und statischen Dateien läuft durch den Proxy.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|json|txt|woff2?)$).*)"],
};
