import { DrawLab } from "@/components/kid/draw/DrawLab";

export const dynamic = "force-dynamic";

export default async function ZeichnenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DrawLab userId={Number(id)} />;
}
