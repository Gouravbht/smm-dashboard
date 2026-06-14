import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AnomalyResponseSchema = z.array(
  z.object({
    id: z.string(),
    metric: z.string(),
    value: z.string(),
    expected: z.string(),
    reason: z.string(),
    severity: z.enum(["high", "medium", "low"]),
    section: z.string(),
  })
);

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  const prompt = `You are a data analyst detecting statistical anomalies in social media metrics for "Rare Fitness".

Analyze this dashboard data and identify 2-4 genuine statistical anomalies or noteworthy outliers:

Video Completion Rates:
- Instagram Reels: 88%
- YouTube Videos: 46%
- Facebook Videos: 38%
(Industry benchmark: IG ~60%, YT ~40%, FB ~35%)

Platform Engagement Rates:
- Instagram: 4.2% (industry avg: 1-3%)
- YouTube: 2.8% (industry avg: 2-5%)
- Facebook: 1.6% (industry avg: 0.5-1%)

Follower counts:
- Instagram: 18,400
- YouTube: 142,000 (subscribers)
- Facebook: 12,600

Reach vs Followers ratio:
- Instagram: 142,000 reach / 18,400 followers = 7.7x
- YouTube: 68,000 reach / 142,000 subscribers = 0.48x
- Facebook: 54,000 reach / 12,600 followers = 4.3x

MoM growth:
- Total followers: +12%
- Follower growth itself: +52% (this is growth of growth)
- Total reach: +16%

Content performance from data: ${JSON.stringify(data.contentPosts?.slice(0, 3))}

Return ONLY a valid JSON array (no markdown, no explanation, just raw JSON) with this structure:
[
  {
    "id": "unique-string",
    "metric": "Short metric name",
    "value": "actual value as string",
    "expected": "expected range or benchmark as string",
    "reason": "One sentence explaining why this is anomalous and what it means",
    "severity": "high" | "medium" | "low",
    "section": "which dashboard section this relates to"
  }
]

Only flag genuinely interesting anomalies — not everything that differs from average.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ anomalies: [] });
    }

    // Strip markdown code fences if present
    const raw = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);
    const validated = AnomalyResponseSchema.parse(parsed);

    return NextResponse.json({ anomalies: validated });
  } catch {
    return NextResponse.json({ anomalies: [] });
  }
}
