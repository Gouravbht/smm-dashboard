import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
- Instagram Reels: 88% (industry avg ~60%) ← significantly above average
- YouTube Videos: 46% (industry avg ~40%)
- Facebook Videos: 38% (industry avg ~35%)

Platform Engagement Rates:
- Instagram: 4.2% (industry avg 1-3%) ← above average
- YouTube: 2.8% (industry avg 2-5%)
- Facebook: 1.6% (industry avg 0.5-1%)

Reach vs Followers ratio:
- Instagram: 142,000 reach / 18,400 followers = 7.7x ← viral reach
- YouTube: 68,000 reach / 8,200 subscribers = 8.3x ← strong reach on a small base
- Facebook: 54,000 reach / 12,600 followers = 4.3x

MoM growth:
- Follower growth rate itself: +52% MoM ← very high acceleration
- Total reach: +16% MoM

Content from data: ${JSON.stringify((data.contentPosts ?? []).slice(0, 3))}

Return ONLY a valid JSON array (no markdown, no code fences, no explanation — raw JSON only):
[
  {
    "id": "unique-id",
    "metric": "Short metric name",
    "value": "actual value",
    "expected": "expected range or benchmark",
    "reason": "One sentence explaining why this is anomalous and what it means for the brand",
    "severity": "high",
    "section": "which dashboard section"
  }
]`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    const raw = (response.choices[0]?.message?.content ?? "")
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(raw);
    const validated = AnomalyResponseSchema.parse(parsed);
    return NextResponse.json({ anomalies: validated });
  } catch {
    return NextResponse.json({ anomalies: [] });
  }
}
