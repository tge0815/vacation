import { ExercisePlayer } from "@/components/kid/ExercisePlayer";

export const dynamic = "force-dynamic";

export default async function UebungPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subjectId?: string; topicId?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const subjectId = Number(sp.subjectId);
  const topicId = sp.topicId ? Number(sp.topicId) : null;

  if (!subjectId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-neutral-500">
        Kein Fach gewählt.
      </main>
    );
  }

  return <ExercisePlayer userId={Number(id)} subjectId={subjectId} topicId={topicId} />;
}
