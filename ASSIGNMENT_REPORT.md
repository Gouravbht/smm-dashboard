# Social Media Analytics Dashboard — Full Implementation Report

> **Prepared for:** HumanAI — AI Frontend Engineer assignment presentation & defense
> **Project:** Rare Fitness SMM Analytics Dashboard
> **Stack:** Next.js 14 (App Router) · TypeScript (strict) · Recharts · Zustand · Zod · Tailwind · Groq AI

This document is your **presentation script + counter-question survival guide**. It explains *what* was built, *why* each decision was made, and *how* the hard parts work — with the exact code snippets you'll want to point to.

---

## 1. Executive Summary (your 30-second pitch)

> "I built a production-grade social media analytics dashboard for a fitness brand. It has 8 data-driven sections, all rendered from a typed Zustand store with zero hardcoded values in the JSX. The standout is AI integration as a first-class citizen: every section has streaming AI insights, there's a dashboard-wide summary that re-generates when you change filters, and an anomaly detector that runs automatically on load and flags statistical outliers. The AI key never touches the browser — all calls go through Next.js server route handlers."

**The three things that make this senior-level, not a tutorial:**
1. **State discipline** — data lives in one typed store; components are pure renderers driven by a `getFilteredData(platforms)` selector.
2. **AI is ambient, not bolted-on** — streaming insights, filter-reactive summary, auto-running anomaly detection.
3. **Type safety end-to-end** — Zod schemas are the single source of truth; `z.infer<>` derives every TypeScript type. Zero `any`.

---

## 2. Tech Stack & Reasoning (the "why did you pick X" defense)

| Layer | Choice | Why this, and what I'd say if challenged |
|---|---|---|
| **Framework** | Next.js 14 App Router | Required by brief. App Router's **route handlers** let me keep the AI API key server-side cleanly — that's the security-critical requirement. Server Components reduce client JS for static shells. |
| **Language** | TypeScript (strict) | Required. Strict mode + zero `any` was a hard rule. Catches data-shape mismatches at compile time, not in the browser. |
| **Charts** | Recharts | Required. Declarative, composes as React components, covers Line/Bar/Area. Trade-off: it's SVG-based so very large datasets would lag — fine here (12 months / 4 weeks). |
| **State** | Zustand | Lighter than Redux, less boilerplate than Context+useReducer. The selector pattern (`getFilteredData`) is exactly what a dashboard needs. No providers to wrap. |
| **Validation** | Zod | Co-located schemas double as **runtime validators** (for AI responses) *and* compile-time types via `z.infer`. One definition, two guarantees. |
| **Styling** | Tailwind v3 + HSL CSS vars | Fast to build a pixel-matched UI. HSL custom properties make dark/light theming a variable swap, not a class explosion. |
| **Theming** | next-themes | Zero-flash dark/light with `class` strategy. Handles the SSR hydration edge case. |
| **AI** | Groq (`llama-3.3-70b-versatile`) | Originally Anthropic Claude, but switched to **Groq free tier** when credits ran out. Groq is extremely fast (good for streaming UX) and free. The architecture is provider-agnostic — only the route handler changed. |
| **Streaming** | Web Streams `ReadableStream` (SSE) | Native to Next.js route handlers, no extra dependency. Server-Sent Events format (`data: {...}\n\n`) is the standard for one-way token streaming. |

**Likely counter-question: "Why Zustand over Redux Toolkit?"**
> For a read-heavy dashboard with one data domain and a filter domain, Redux's action/reducer/dispatch ceremony adds friction without payoff. Zustand gives me the same single-source-of-truth and selector subscriptions in ~10 lines per store. If this grew to need middleware, time-travel debugging, or many teams touching it, I'd reconsider.

**Likely counter-question: "Why not React Query / SWR for the AI calls?"**
> Those shine for cacheable GET data. My AI calls are streaming POSTs (insights) and one-shot POSTs (anomaly) — there's nothing to cache or revalidate. I manage the stream manually with `fetch` + `ReadableStream.getReader()`, which gives me token-by-token UI updates that React Query doesn't natively model.

---

## 3. Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│  data/mockData.ts  (typed March-2026 dataset, DashboardData)   │
└───────────────────────────┬──────────────────────────────────┘
                            │ loaded once
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  store/dashboardStore.ts                                       │
│    data: DashboardData                                         │
│    getFilteredData(platforms) → filtered DashboardData         │
└───────────────────────────┬──────────────────────────────────┘
                            │ selector
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Section components   filterStore         AI components
  (pure renderers)     (dateRange,         (call /api/ai/*)
        │              activePlatforms,         │
        │              showMoM)                 │
        ▼                   │                   ▼
   Recharts / cards ◄───────┘          Next.js route handlers
                                       (server-side, hold GROQ_API_KEY)
                                                │
                                                ▼
                                          Groq LLM (streamed)
```

**The golden rule I enforced:** *No data literal lives in a section's JSX.* Every number comes from the store. This is the thing to demo live — open any section file and show it only reads from `getFilteredData`.

---

## 4. Type System — Zod as Single Source of Truth

Every shape is a Zod schema; the TypeScript type is **derived**, never hand-written separately.

```ts
// types/index.ts
export const PlatformSchema = z.enum(["instagram", "youtube", "facebook"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const ContentPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  platform: PlatformSchema,
  type: ContentTypeSchema,
  date: z.string(),
  likes: z.number(),
  comments: z.number(),
  shares: z.number(),
  saves: z.number(),     // -1 sentinel = "N/A" (metric not available on that platform)
  reach: z.number(),
  engagementRate: z.number(),
});
export type ContentPost = z.infer<typeof ContentPostSchema>;
```

**Why this matters (say this):** The same `AnomalySchema` that types my component also **validates the AI's JSON response at runtime**. If the LLM returns a malformed object, `.parse()` throws and I fall back to an empty array — the UI never crashes on bad AI output.

```ts
// app/api/ai/anomaly/route.ts — runtime validation of LLM output
const parsed = JSON.parse(raw);
const validated = AnomalyResponseSchema.parse(parsed);  // Zod guards the boundary
return NextResponse.json({ anomalies: validated });
```

---

## 5. State Management — The Selector Pattern

```ts
// store/dashboardStore.ts
export const useDashboardStore = create<DashboardState>()((_, get) => ({
  data: MOCK_DATA,

  getFilteredData: (platforms: Platform[]): DashboardData => {
    const { data } = get();
    if (platforms.length === 0 || platforms.length === 3) return data;

    return {
      ...data,
      platforms: data.platforms.filter((p) => platforms.includes(p.platform)),
      contentPosts: data.contentPosts.filter((p) => platforms.includes(p.platform)),
      weeklyReach: data.weeklyReach.map((w) => {
        const f = { ...w };
        if (!platforms.includes("instagram")) f.instagram = 0;
        if (!platforms.includes("youtube"))   f.youtube = 0;
        if (!platforms.includes("facebook"))  f.facebook = 0;
        f.total = f.instagram + f.youtube + f.facebook;
        return f;          // recompute the stacked total so the bar chart stays correct
      }),
      // audienceGrowth filtered the same way…
    };
  },
}));
```

Two separate stores by concern:
- **`dashboardStore`** — the data + the filtering logic.
- **`filterStore`** — UI filter state (`dateRange`, `activePlatforms`, `showMoM`) + actions (`togglePlatform`, `toggleMoM`, …).

**Counter-question: "Why two stores instead of one?"**
> Separation of concerns. Data and the act of filtering it are one domain; the *user's current filter selections* are a UI domain. Keeping them apart means a component that only needs the filter state doesn't re-render when data changes, and vice versa.

A component consuming both:
```tsx
const { getFilteredData } = useDashboardStore();
const { activePlatforms, dateRange } = useFilterStore();
const { kpi: rawKpi } = getFilteredData(activePlatforms);
const kpi = scaledKPI(rawKpi, dateRange.label);  // date range actually changes the numbers
```

---

## 6. The 8 Dashboard Sections

| # | Section | Chart / UI | Data source |
|---|---|---|---|
| 1 | **Audience Overview** | 5 KPI cards + SVG sparklines + MoM badges | `kpi` (date-scaled) |
| 2 | **Platform Breakdown** | 3 brand cards, 6-metric grid, green ↑ deltas, ✓ marks | `platforms[]` |
| 3 | **Audience Growth** | Recharts `LineChart`, 3 lines + optional prev-year ghost lines | `audienceGrowth[]` |
| 4 | **Weekly Reach** | Recharts stacked `BarChart` + platform tabs | `weeklyReach[]` |
| 5 | **Content Performance** | Sortable table, N/A handling, platform tabs | `contentPosts[]` |
| 6 | **Video Completion** | Completion bars + YouTube `AreaChart` drop-off curve w/ reference lines | `videoCompletion[]`, `dropOffCurve[]` |
| 7 | **Audience by Location** | City list w/ bars + Punjab 62% concentration card | `locations[]`, `punjabConcentration` |
| 8 | **Post Attribution Funnel** | 6 numbered stage cards (scroll-animated) + conversion row | `attributionFunnel[]` |

**Reusable layout primitives** (`components/layout/Section.tsx`): `Section`, `Panel`, `PanelHeader`, `AICallout`. This is your "I don't repeat myself" talking point — every section is wrapped in the same primitives, so spacing/borders/AI-callout styling is defined once.

---

## 7. AI Integration — The Centerpiece

### Three distinct AI features, three patterns:

#### (A) Section Insights — *streaming*
Per-section sparkle button. Streams a 3-point analysis (Observation / Business Impact / Recommendation).

**Server (route handler) — key is server-side only:**
```ts
// app/api/ai/insight/route.ts
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });  // never reaches browser

const readableStream = new ReadableStream({
  async start(controller) {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
    }
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
  },
});
return new Response(readableStream, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

**Client — reads the stream token-by-token:**
```tsx
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value, { stream: true }).split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6);
    if (payload === "[DONE]") break;
    const parsed = JSON.parse(payload);
    if (parsed.text) setRawText((p) => p + parsed.text);  // UI updates live
  }
}
```

The streamed text is parsed into structured points as it arrives, then rendered with per-point icons (Eye / TrendingUp / Lightbulb).

#### (B) Dashboard Summary — *filter-reactive*
A panel above the KPIs. Sends current KPIs + active filters, returns WORKING / UNDERPERFORMING / ACTION sections. **Re-fetches automatically when filters change**, debounced ~600ms so toggling platforms rapidly doesn't spam the API.

#### (C) Anomaly Detector — *automatic, the bonus feature*
Runs once on page load with no user action. Sends a data snapshot, the LLM returns a JSON array of statistical outliers, validated by Zod, rendered as dismissible severity-coded cards. Also pushes its count to a small `anomalyStore` so the **sidebar shows a red badge**.

**Counter-question: "Why is the anomaly detector your bonus pick?"**
> Because it makes the AI feel *native*. The user doesn't ask for it — they open the dashboard and the AI has already noticed "YouTube reach-to-subscriber ratio is unusually low." That's ambient intelligence, which is the direction analytics products are heading, and it demos beautifully.

**Counter-question: "How do you stop a bad AI response from breaking the page?"**
> Three layers: (1) the route handler wraps everything in try/catch and returns `{ anomalies: [] }` on any failure; (2) Zod `.parse()` rejects malformed JSON before it reaches React; (3) the component renders nothing if the array is empty. The dashboard degrades gracefully with no key, a rate limit, or garbage output.

---

## 8. Security — The API Key Question (they WILL ask)

> "The AI key is in `.env.local` as `GROQ_API_KEY`, read **only** inside `app/api/ai/*` route handlers, which run on the server. It's never imported into a client component, never in `NEXT_PUBLIC_*`, so it never ships in the browser bundle. The browser only ever talks to my own `/api/ai/...` endpoints, which proxy to Groq. That's the whole reason I needed App Router route handlers rather than calling the LLM from the client."

Proof points you can show live:
- `.env.example` documents the var; `.env.local` (gitignored) holds the real key.
- Search the client bundle for the key → it isn't there.
- Every `groq` instance is constructed inside a `route.ts`, never in a `"use client"` file.

---

## 9. Polish Features (the enhancements round)

| Feature | How it works | File |
|---|---|---|
| **Sidebar collapse** | `sidebarStore` boolean; nav panel animates `w-[188px] → w-0` | `Sidebar.tsx` |
| **Skeleton loaders** | Section shows shimmer placeholders for ~900–1200ms on mount | `ui/Skeleton.tsx` |
| **Export CSV** | Builds CSV from `contentPosts`, triggers Blob download | `Header.tsx` |
| **AI auto-expand** | Audience Overview insight auto-fires 1.8s after load | `AIInsightButton.tsx` (`autoFetch` prop) |
| **Funnel scroll animation** | `IntersectionObserver` fades/slides cards with staggered delay | `PostAttributionFunnel.tsx` |
| **Anomaly badge** | `anomalyStore` count → red badge on sidebar "Social Media" | `anomalyStore.ts` + `Sidebar.tsx` |
| **Live sync dot** | Pulsing green `animate-ping` + "Last synced" timestamp | `PageTitle.tsx` |
| **vs Last Year** | `showMoM` toggle adds dashed prev-year ghost lines to growth chart | `AudienceGrowth.tsx` |
| **Date range wiring** | `scaledKPI()` multiplies reach/content/growth by a per-range factor | `mockData.ts` |

**Scroll-animation snippet (a clean `IntersectionObserver` hook):**
```tsx
function useInView(ref, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}
```

---

## 10. Hard Problems I Solved (great "tell me about a bug" answers)

1. **Hydration mismatch on sparklines** — `Math.random()` produced different SVG paths on server vs client. **Fix:** deterministic static height arrays. *Lesson: any randomness in render breaks SSR hydration.*

2. **`useTheme()` undefined on SSR** — next-themes returns `undefined` until mounted. **Fix:** a `mounted` flag set in `useEffect`, render a neutral icon until then.

3. **Anthropic credits ran out mid-build** — **Fix:** swapped to Groq. Because all AI logic was isolated in route handlers, only 3 files changed and the entire frontend was untouched. *This proves the abstraction was right.*

4. **Recharts + TypeScript formatter types** — their `Formatter` generics rejected my typed callbacks. **Fix:** accept `unknown` and narrow with `typeof value === "number"` at runtime.

5. **lucide-react removed brand icons** (Instagram/YouTube/Facebook, trademark reasons). **Fix:** hand-rolled SVG components in `ui/brand-icons.tsx`.

6. **AI button colliding with section label** — a `-mt-7` negative-margin hack overlapped the heading. **Fix:** added a proper `action` slot to the `Section` primitive (flex row), removing the hack.

7. **Light-mode contrast** — AI text used `*-400` colors that washed out on white. **Fix:** `text-blue-600 dark:text-blue-400` pattern across AI components.

---

## 11. How to Run (for the README / live demo)

```bash
npm install
cp .env.example .env.local        # then add your key:
# GROQ_API_KEY=gsk_...   (free at https://console.groq.com)
npm run dev                        # http://localhost:3000
```

Everything except the AI features works **without** a key — UI, charts, state, filters all run on mock data. AI features degrade gracefully (empty/silent) if the key is missing.

```bash
npm run build      # production build — passes, zero TS errors
```

---

## 12. Anticipated Counter-Questions — Quick-Fire Answers

**Q: Where does the mock data come from / is it realistic?**
> Hand-authored to be internally consistent for March 2026 — e.g. the weekly reach bars sum to the stated totals, growth-chart end values match the platform cards (IG 18,400 / YT 12,600 / FB 8,200). In production this layer is swapped for real Meta Graph API / YouTube Data API v3 calls; the store contract stays identical.

**Q: Your data doesn't match the reference table exactly — why? (IMPORTANT — be ready for this)**
> I caught that the reference data is internally inconsistent and made a deliberate call to keep the dashboard coherent. Two specifics: (1) The reference lists **Total Reach 2,640,000**, but the three platform reaches sum to **264,000** — there's an extra zero. A headline KPI that's 10× the sum of its parts is a data-integrity bug, so I used 264,000. (2) The reference lists **YouTube Followers 142,000**, which is identical to Instagram's *Reach* cell (a likely copy error) and would mean 142K subscribers producing only 68K monthly views — a 0.48× view rate that's implausible; I used 8,200 subscribers, consistent with the 68K views. Every other reference value is used exactly as given. The brief literally says *"Show us how you think"* — silently copying contradictory numbers would have been the wrong instinct. And it's a one-line change in `mockData.ts` to revert to the literal values if exact-match is the requirement. *(This is documented in the README under "A Note on the Reference Data".)*

**Q: How would you add a real data source?**
> Replace `MOCK_DATA` with a fetch in the store (or a Server Component that hydrates it), keep the same `DashboardData` shape so Zod validates the API response. No component changes needed — that's the point of the typed contract.

**Q: Is it responsive / accessible?**
> Layout is optimized for desktop analytics use (the brief's reference is a desktop product). Semantic HTML, keyboard-focusable controls, color choices meet contrast in both themes. Full mobile breakpoints would be the next iteration.

**Q: How do you handle AI latency / cost?**
> Streaming makes latency *feel* instant — first tokens appear in well under a second on Groq. The summary is debounced so filter spam doesn't fan out into many calls. `max_tokens` is capped per route (200 for insights, 600 for anomalies) to bound cost and time.

**Q: What would you do with more time?**
> Real API integration, persisted user preferences (filters/theme), unit tests on the store selectors and the stream parser, e2e test of the AI flow with a mocked provider, and proper mobile layouts.

**Q: Why is there no test suite?**
> Time-boxed. The highest-value tests here are pure functions — `getFilteredData`, `scaledKPI`, and the `parsePoints` stream parser — because they're deterministic and carry the business logic. That's exactly where I'd start.

---

## 13. One-Paragraph Closer (memorize this)

> "The brief asked for a dashboard, but the real test was judgment: typed data contracts so the UI can't drift from the data, a clean store/selector boundary so filtering is one function not scattered logic, and AI treated as a product feature with a secure server boundary — streaming insights, a filter-aware summary, and an anomaly detector that works the moment you open the page. Everything degrades gracefully without an API key, and swapping the entire AI provider mid-project touched only three files. That's the architecture I'm proud of."
