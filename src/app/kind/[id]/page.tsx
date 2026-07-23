import { KidToday } from "@/components/kid/KidToday";

export const dynamic = "force-dynamic";

export default async function KidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KidToday userId={Number(id)} />;
}
