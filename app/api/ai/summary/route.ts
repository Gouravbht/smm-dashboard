import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { kpi, platforms, filters } = await req.json();

  const platformsText = filters.activePlatforms.join(", ");
  const dateText = filters.dateRange.label;

  const prompt = `You are a social media strategist analyzing performance data for "Rare Fitness" — a fitness brand.

Period: ${dateText} | Active platforms: ${platformsText}

KPIs:
- Total Followers: ${kpi.totalFollowers.toLocaleString()} (${kpi.mom.totalFollowers > 0 ? "+" : ""}${kpi.mom.totalFollowers}% MoM)
- Follower Growth: +${kpi.followerGrowth} (${kpi.mom.followerGrowth > 0 ? "+" : ""}${kpi.mom.followerGrowth}% MoM)
- Total Reach: ${kpi.totalReach.toLocaleString()} (${kpi.mom.totalReach > 0 ? "+" : ""}${kpi.mom.totalReach}% MoM)
- Avg Engagement Rate: ${kpi.avgEngagementRate}% (${kpi.mom.avgEngagementRate > 0 ? "+" : ""}${kpi.mom.avgEngagementRate}% MoM)
- Content Published: ${kpi.contentPublished} posts

Platform breakdown: ${JSON.stringify(platforms.map((p: { platform: string; followers: number; reach: number; engagementRate: number }) => ({ platform: p.platform, followers: p.followers, reach: p.reach, engagementRate: p.engagementRate })))}

Respond in exactly 3 short paragraphs separated by newlines:
1. What's working well (be specific with numbers)
2. What's underperforming or needs attention (be specific)
3. One concrete next action they should take this week

Keep each paragraph to 2 sentences max. Plain text only, no markdown.`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
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
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
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
