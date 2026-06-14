import Groq from "groq-sdk";
import { NextRequest } from "next/server";
import { MOCK_DATA } from "@/data/mockData";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DASHBOARD_CONTEXT = `
Rare Fitness — Social Media Dashboard (March 2026)

KPIs:
- Total Followers: 264,000 (Instagram 185K | YouTube 8.2K | Facebook 70.8K)
- Total Reach: 264,000
- Follower Growth: +3,200 this month (+1.2% MoM)
- Avg Engagement Rate: 4.2% (industry avg for fitness: ~2.8%)
- Content Published: 47 posts

Platform Details:
- Instagram: 185,000 followers · 4.8% ER · 68% Reels completion · best performer
- YouTube: 8,200 subscribers · 68,000 views · 44% avg retention · growing +18% YoY
- Facebook: 70,800 followers · 2.1% ER · 15,000 reach · underperforming

Top Content This Month:
${MOCK_DATA.contentPosts
  .slice(0, 5)
  .map((p) => `- "${p.title}" (${p.platform} ${p.type}): ${p.reach.toLocaleString()} reach, ${p.engagementRate}% ER`)
  .join("\n")}

Audience:
- 62% based in Punjab (Amritsar 23%, Ludhiana 17%, Delhi NCR 14%)
- Diaspora (UAE + UK): 7% and growing

Funnel (March 2026):
- 412,000 impressions → 3,840 link clicks (0.93% CTR) → 349 leads captured

Video Retention:
- Instagram Reels: 68% completion
- YouTube: 44% avg (50% drop-off at 2:30 mark)
- Facebook: 38% estimated

Best Time to Post:
- Thursday 6–9pm: engagement index 91/100
- Saturday 9am–12pm: engagement index 90/100
- Saturday 6–9am: engagement index 88/100
`.trim();

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question?.trim()) {
    return Response.json({ error: "No question provided" }, { status: 400 });
  }

  const prompt = `You are an AI analyst for the Rare Fitness social media dashboard. Answer the user's question using ONLY the data provided. Be direct and specific — cite exact numbers. Max 3 sentences.

Dashboard Data:
${DASHBOARD_CONTEXT}

Question: ${question}

Rules:
- Cite specific numbers from the data
- Do not make up data not listed above
- If the question cannot be answered from the data, say so briefly
- No bullet points, no headers — flowing sentences only`;

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 150,
          temperature: 0.3,
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
