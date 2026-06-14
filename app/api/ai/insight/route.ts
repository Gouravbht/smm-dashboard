import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { section, data } = await req.json();

  const prompt = `You are analyzing a section of a social media analytics dashboard for a fitness brand called "Rare Fitness".

Section: ${section}
Data: ${JSON.stringify(data, null, 2)}

Write exactly 2-3 sentences of insight:
1. What is notable or interesting in this data?
2. Why does it matter for the brand?
3. One specific, actionable recommendation based on the numbers.

Be direct and specific — use the actual numbers. No fluff, no markdown headers. Plain text only.`;

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err: unknown) {
        const msg =
          err instanceof Error && err.message.includes("credit balance")
            ? "Insufficient Anthropic credits. Add credits at console.anthropic.com/settings/billing."
            : err instanceof Error
            ? err.message
            : "Stream failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
