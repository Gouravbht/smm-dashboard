# SMM Dashboard — Rare Fitness

> **Loom Walkthrough**: https://www.loom.com/share/eb42d95d7caf4f0081cb2c9f4da491fb

A production-ready Social Media Analytics Dashboard built for the HumanAI AI Frontend Engineer assignment.

## Stack

- **Next.js 14** (App Router) — Framework; server-side route handlers keep the AI key off the client
- **TypeScript** (strict, zero `any`) — Type safety
- **Recharts** — Line, Bar, and Area charts
- **Zustand** — State management (all data from store, zero data in JSX)
- **Zod** — Runtime schema validation + TypeScript type inference (`z.infer`)
- **Groq** (`llama-3.3-70b-versatile`) — AI insights, streamed via SSE
- **Tailwind CSS** — Styling with HSL CSS-variable theming
- **next-themes** — Dark/light mode

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd smm-dashboard
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:
```
GROQ_API_KEY=gsk_your-key-here
```

Get a free key at: https://console.groq.com

> Note: All dashboard UI and charts work without an API key. AI features (Summary panel, Section Insights, Anomaly Detector) require the key and degrade gracefully without it.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Production build

```bash
npm run build
npm start
```

## Features

### Dashboard Sections (8 total)
1. **Audience Overview** — KPI strip with MoM delta badges + sparklines
2. **Platform Breakdown** — Cards for Instagram, YouTube, Facebook
3. **Audience Growth** — Multi-line chart Apr 2025 → Mar 2026 (+ optional "vs Last Year" ghost lines)
4. **Weekly Reach** — Stacked bar chart with platform tab filter
5. **Content Performance** — Sortable table (click any column header) + CSV export
6. **Video Completion** — Progress bars + YouTube audience retention curve
7. **Audience by Location** — City list + Punjab 62% concentration highlight
8. **Post Attribution Funnel** — Posts → Impressions → Clicks → Sessions → Form → Leads (scroll-animated)

### Filters (all update every section from state)
- **Date range picker** — presets from last 7 days to 12 months; scales KPI reach/content/growth
- **Platform filter** — toggle Instagram/YouTube/Facebook individually
- **vs Last Year** — overlays previous-year growth as dashed ghost lines
- **Dark/Light mode** — toggle in header
- **Sidebar collapse** — toggle the nav panel

### AI Features (3)
- **A — Section Insights**: Click the ✦ button on any section → streams a structured 3-point insight (Observation / Business Impact / Recommendation) generated from that section's **actual state data**.
- **B — Dashboard Summary**: Auto-fetches on load + **re-fetches when filters change** (debounced). Shows what's working, what's underperforming, and one next action.
- **C — Anomaly Detector (Bonus)**: On load, AI scans all metrics for statistical outliers and surfaces dismissible alert cards. The count also appears as a badge on the sidebar.

All AI calls go through Next.js server-side route handlers (`/api/ai/*`). **The API key never touches the client** — the browser only talks to our own endpoints, which proxy to Groq.

## A Note on the Reference Data

The assignment's reference data table is **internally inconsistent**, so I made a deliberate engineering choice to use a coherent dataset rather than copy values that contradict each other:

| Reference value (as given) | Why it's inconsistent | What this dashboard uses |
|---|---|---|
| **Total Reach 2,640,000** | The three platform reaches (142,000 + 68,000 + 54,000) sum to **264,000**, not 2,640,000 — an apparent extra zero. | **264,000** (matches the sum of platform reach) |
| **YouTube Followers 1,42,000** | Identical to Instagram's *Reach* value (likely a copy error), and implies 142K subscribers generating only 68K monthly views — an implausible 0.48× view rate. | **8,200 subscribers** (consistent with 68K views; YouTube labels this "subscribers", not "followers") |
| **MoM deltas** | Adjusted to stay consistent with the corrected absolute values. | Internally consistent set |

All other reference values are used **exactly as given**: Total Followers 39,200 · Follower Growth 640 · Avg Engagement 3.2% · Content Published 48 (22 IG · 14 YT · 12 FB) · Instagram 18,400 / 142,000 / 4.2% · Facebook 12,600 / 54,000 / 1.6% · and the full attribution funnel (48 → 412,000 → 3,840 → 2,380 → 572 → 349).

> **Rationale:** The brief says *"A working dashboard with great AI integration beats a pixel-perfect UI… Show us how you think."* A real analytics dashboard must be internally coherent — a headline "Total Reach" that's 10× the sum of its parts would be a data-integrity bug. The numbers above are trivially switched back to the literal reference values in `data/mockData.ts` if exact-match is preferred.

## Architecture

```
app/
  api/ai/
    insight/route.ts    # Stream section insight (SSE)        — llama-3.3-70b-versatile
    summary/route.ts    # Stream dashboard summary (SSE)      — llama-3.3-70b-versatile
    anomaly/route.ts    # Detect outliers, return JSON (Zod-validated)
  layout.tsx
  page.tsx              # Root page — composes all sections

components/
  layout/               # Sidebar, Header, PageTitle, Section primitives
  sections/             # 8 dashboard sections (read from Zustand)
  ai/                   # AIInsightButton, DashboardSummary, AnomalyAlerts
  ui/                   # Skeleton, brand-icons, shadcn primitives

store/
  dashboardStore.ts     # All dashboard data + getFilteredData selector
  filterStore.ts        # dateRange, activePlatforms, showMoM + actions
  sidebarStore.ts       # Sidebar collapse state
  anomalyStore.ts       # Anomaly count (drives sidebar badge)

types/index.ts          # All Zod schemas + inferred TypeScript types
data/mockData.ts        # Full typed March 2026 dataset + date-range scaling
```

## State Discipline

No data literal lives in any section's JSX. Every number is read from the Zustand store via `getFilteredData(activePlatforms)`, which returns a filtered `DashboardData`. Changing the platform filter or date range updates **every** section from state.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | For AI features | Groq API key — get a free one at https://console.groq.com |
