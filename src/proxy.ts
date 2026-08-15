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

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  // Redirect-Ziele aus nextUrl ableiten (behält Host/Domain hinter Apache).
  const to = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return url;
  };
  // Startseite je nach Rolle: Kind in seinen Bereich, Admin in den Admin-Bereich,
  // Eltern zur Kinder-Auswahl.
  const homeFor = (s: NonNullable<typeof session>) =>
    s.role === "child" ? `/kind/${s.userId}` : s.role === "admin" ? "/admin" : "/";

  if (isPublic) {
    // Bereits angemeldet? Login/Register überspringen → zur passenden Startseite.
    if (session && !isApi) {
      return NextResponse.redirect(to(homeFor(session)));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    return NextResponse.redirect(to("/login"));
  }

  // Admin: nur der /admin-Bereich ist erreichbar (Seiten). Umgekehrt darf
  // niemand außer dem Admin nach /admin. Die /api/admin-Endpunkte sichern sich
  // zusätzlich selbst über requireAdmin ab.
  if (!isApi) {
    if (session.role === "admin") {
      if (!pathname.startsWith("/admin")) return NextResponse.redirect(to("/admin"));
    } else if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return NextResponse.redirect(to(homeFor(session)));
    }
  }

  // Kind-Login: nur der eigene Kind-Bereich ist erreichbar (Seiten). Die
  // API-Endpunkte setzen die Feinabsicherung pro userId/Rolle selbst durch.
  if (session.role === "child" && !isApi) {
    const home = `/kind/${session.userId}`;
    if (pathname === "/" || pathname.startsWith("/eltern")) {
      return NextResponse.redirect(to(home));
    }
    if (pathname.startsWith("/kind/")) {
      const seg = pathname.split("/")[2];
      if (seg && seg !== String(session.userId)) {
        return NextResponse.redirect(to(home));
      }
    }
  }

  return NextResponse.next();
}

// Gate: alles außer Next-Assets und statischen Dateien läuft durch den Proxy.
// Wichtig: .webmanifest und .js (z.B. /sw.js) müssen frei erreichbar sein –
// sonst leitet der Gate sie für nicht angemeldete Besucher auf /login um und
// die PWA-Installation (Manifest/Service Worker) auf iOS/Android schlägt fehl.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|json|txt|woff2?|webmanifest|js)$).*)"],
};
