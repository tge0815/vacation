import { NextRequest, NextResponse } from "next/server";
import { listRewardPackages, createRewardPackage } from "@/lib/db/repo";
import { publicRewardPackage } from "@/lib/serialize";
import { sessionFrom, requireParent, unauthorized } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → Pakete der Familie. ?all=1 (nur Eltern) liefert auch inaktive Pakete.
export async function GET(req: NextRequest) {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (all && s.role !== "parent") {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }
  const packages = listRewardPackages(s.familyId, !all).map(publicRewardPackage);
  return NextResponse.json({ packages });
}

// POST { minutes, coins } → neues Paket (nur Eltern).
export async function POST(req: NextRequest) {
  const familyId = await requireParent(req);
  if (familyId instanceof NextResponse) return familyId;
  const body = (await req.json()) as { minutes?: number; coins?: number };
  const minutes = Math.round(Number(body.minutes));
  const coins = Math.round(Number(body.coins));
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return NextResponse.json({ error: "Minuten müssen > 0 sein" }, { status: 400 });
  }
  if (!Number.isFinite(coins) || coins <= 0) {
    return NextResponse.json({ error: "Coins müssen > 0 sein" }, { status: 400 });
  }
  const pkg = createRewardPackage(familyId, minutes, coins);
  return NextResponse.json({ package: publicRewardPackage(pkg) });
}
