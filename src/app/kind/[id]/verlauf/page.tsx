import { KidHistory } from "@/components/kid/KidHistory";

export const dynamic = "force-dynamic";

export default async function VerlaufPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KidHistory userId={Number(id)} />;
}
