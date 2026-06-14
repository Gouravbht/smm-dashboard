import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  let kpi: unknown, platforms: unknown, filters: unknown;
  try {
    ({ kpi, filters, platforms } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!kpi || !filters || !platforms) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const typedKpi = kpi as { totalFollowers: number; followerGrowth: number; totalReach: number; avgEngagementRate: number; contentPublished: number; mom: Record<string, number> };
  const typedFilters = filters as { activePlatforms: string[]; dateRange: { label: string } };
  const typedPlatforms = platforms as { platform: string; followers: number; reach: number; engagementRate: number }[];

  const platformsText = typedFilters.activePlatforms.join(", ");
  const dateText = typedFilters.dateRange.label;

  const prompt = `You are a social media strategist analyzing performance for "Rare Fitness" fitness brand.

Period: ${dateText} | Platforms: ${platformsText}

KPIs:
- Total Followers: ${typedKpi.totalFollowers.toLocaleString()} (${typedKpi.mom.totalFollowers > 0 ? "+" : ""}${typedKpi.mom.totalFollowers}% MoM)
- Follower Growth: +${typedKpi.followerGrowth} (${typedKpi.mom.followerGrowth > 0 ? "+" : ""}${typedKpi.mom.followerGrowth}% MoM)
- Total Reach: ${typedKpi.totalReach.toLocaleString()} (${typedKpi.mom.totalReach > 0 ? "+" : ""}${typedKpi.mom.totalReach}% MoM)
- Avg Engagement Rate: ${typedKpi.avgEngagementRate}% (${typedKpi.mom.avgEngagementRate > 0 ? "+" : ""}${typedKpi.mom.avgEngagementRate}% MoM)
- Content Published: ${typedKpi.contentPublished} posts

Platforms: ${JSON.stringify(
    typedPlatforms.map((p) => ({
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
