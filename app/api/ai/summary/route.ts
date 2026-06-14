import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { kpi, platforms, filters } = await req.json();

  const platformsText = filters.activePlatforms.join(", ");
  const dateText = filters.dateRange.label;

  const prompt = `You are a social media strategist analyzing performance for "Rare Fitness" fitness brand.

Period: ${dateText} | Platforms: ${platformsText}

KPIs:
- Total Followers: ${kpi.totalFollowers.toLocaleString()} (${kpi.mom.totalFollowers > 0 ? "+" : ""}${kpi.mom.totalFollowers}% MoM)
- Follower Growth: +${kpi.followerGrowth} (${kpi.mom.followerGrowth > 0 ? "+" : ""}${kpi.mom.followerGrowth}% MoM)
- Total Reach: ${kpi.totalReach.toLocaleString()} (${kpi.mom.totalReach > 0 ? "+" : ""}${kpi.mom.totalReach}% MoM)
- Avg Engagement Rate: ${kpi.avgEngagementRate}% (${kpi.mom.avgEngagementRate > 0 ? "+" : ""}${kpi.mom.avgEngagementRate}% MoM)
- Content Published: ${kpi.contentPublished} posts

Platforms: ${JSON.stringify(
    platforms.map((p: { platform: string; followers: number; reach: number; engagementRate: number }) => ({
      platform: p.platform,
      followers: p.followers,
      reach: p.reach,
      engRate: p.engagementRate,
    }))
  )}

Respond using EXACTLY this format — do not deviate, no markdown, no extra text:

WORKING:
• [specific finding with exact number]
• [specific finding with exact number]
• [specific finding with exact number]

UNDERPERFORMING:
• [specific finding with exact number]
• [specific finding with exact number]

ACTION:
• [step 1 — concrete and specific]
• [step 2 — concrete and specific]
• [step 3 — concrete and specific]`;

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 350,
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "AI request failed";
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
