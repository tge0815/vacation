import { CodeLab } from "@/components/kid/code/CodeLab";

export const dynamic = "force-dynamic";

export default async function WerkstattPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CodeLab userId={Number(id)} />;
}
