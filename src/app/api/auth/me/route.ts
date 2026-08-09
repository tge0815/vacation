import { NextRequest, NextResponse } from "next/server";
import { familyIdFrom, unauthorized } from "@/lib/auth/server";
import { getFamily } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → aktuelle Familie (Name/E-Mail) für die Anzeige im Header.
export async function GET(req: NextRequest) {
  const familyId = await familyIdFrom(req);
  if (!familyId) return unauthorized();
  const fam = getFamily(familyId);
  if (!fam) return unauthorized();
  return NextResponse.json({ family: { id: fam.id, name: fam.name, email: fam.email } });
}
