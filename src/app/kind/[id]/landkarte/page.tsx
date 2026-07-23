import { MapSession } from "@/components/kid/geo/MapSession";

export const dynamic = "force-dynamic";

export default async function LandkartePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MapSession userId={Number(id)} />;
}
