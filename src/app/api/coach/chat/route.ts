import { NextRequest } from "next/server";
import { streamParentCoach } from "@/lib/ai/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    text?: string;
    useReasoning?: boolean;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of streamParentCoach({
          userText: body.text ?? "",
          useReasoning: Boolean(body.useReasoning),
          history: body.history ?? [],
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ kind: "error", message: msg })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
