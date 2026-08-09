import { NextRequest, NextResponse } from "next/server";
import { sessionFrom, unauthorized } from "@/lib/auth/server";
import { getFamily } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → aktuelle Session: Familie + Rolle (parent/child) + ggf. Kind-ID.
export async function GET(req: NextRequest) {
  const s = await sessionFrom(req);
  if (!s) return unauthorized();
  const fam = getFamily(s.familyId);
  if (!fam) return unauthorized();
  return NextResponse.json({
    family: { id: fam.id, name: fam.name, email: fam.email },
    role: s.role,
    userId: s.userId,
  });
}
