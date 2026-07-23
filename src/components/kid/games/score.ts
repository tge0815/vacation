export type ScoreResult = { best: number; isNewBest: boolean };

export async function submitScore(
  userId: number,
  game: string,
  score: number,
): Promise<ScoreResult> {
  try {
    const r = await fetch("/api/games/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, game, score }),
    });
    if (!r.ok) throw new Error();
    return (await r.json()) as ScoreResult;
  } catch {
    return { best: score, isNewBest: false };
  }
}

export type GameProps = {
  userId: number;
  best?: number;
  onBest?: (best: number) => void;
};
