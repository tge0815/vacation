import { RewardShop } from "@/components/kid/RewardShop";

export const dynamic = "force-dynamic";

export default async function BelohnungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RewardShop userId={Number(id)} />;
}
