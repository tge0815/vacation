import { GamesHub } from "@/components/kid/games/GamesHub";

export const dynamic = "force-dynamic";

export default async function SpielePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GamesHub userId={Number(id)} />;
}
