# SMM Dashboard — Rare Fitness

> **Loom Walkthrough**: [Add link here after recording]

A production-ready Social Media Analytics Dashboard built for the HumanAI AI Frontend Engineer assignment.

## Stack

- **Next.js 14** (App Router) — Framework
- **TypeScript** (strict, zero `any`) — Type safety
- **Recharts** — Line, Bar, Area, and Funnel charts
- **Zustand** — State management (all data from store, zero data in JSX)
- **Zod** — Runtime schema validation + TypeScript type inference
- **Claude API** (Anthropic) — AI insights, streaming SSE
- **Tailwind CSS + shadcn/ui** — Styling and components
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

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at: https://console.anthropic.com

> Note: All dashboard UI and charts work without an API key. AI features (Summary panel, Section Insights, Anomaly Detector) require the key.

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
1. **Audience Overview** — KPI strip with MoM delta badges
2. **Platform Breakdown** — Cards for Instagram, YouTube, Facebook
3. **Audience Growth** — Multi-line chart Apr 2025 → Mar 2026
4. **Weekly Reach** — Stacked bar chart with platform tab filter
5. **Content Performance** — Sortable table (click any column header)
6. **Video Completion** — Progress bars + YouTube audience retention curve
7. **Audience by Location** — City list + Punjab 62% concentration circle
8. **Post Attribution Funnel** — Posts → Impressions → Clicks → Sessions → Form → Leads

### Filters (all update every section from state)
- **Date range picker** — presets: last 7 days to 12 months
- **Platform filter** — toggle Instagram/YouTube/Facebook individually
- **Dark/Light mode** — toggle in header

### AI Features (3)
- **A — Section Insights**: Click the ✦ button on any section → streams 2–3 sentence AI insight from actual state data via `claude-haiku-4-5`
- **B — Dashboard Summary**: Auto-fetches on load + re-fetches on filter change via `claude-sonnet-4-6`. Shows what's working, what's not, one next action.
- **C — Anomaly Detector (Bonus)**: On load, AI scans all metrics for statistical outliers and surfaces dismissible alert cards at the top of the dashboard.

All AI calls go through Next.js server-side route handlers (`/api/ai/*`). The API key never touches the client.

## Architecture

```
app/
  api/ai/
    insight/route.ts    # Stream section insight via claude-haiku-4-5
    summary/route.ts    # Stream dashboard summary via claude-sonnet-4-6
    anomaly/route.ts    # Detect outliers, return JSON via claude-haiku-4-5
  layout.tsx
  page.tsx              # Root page — composes all sections

components/
  layout/               # Sidebar, Header, PageTitle
  sections/             # 8 dashboard sections (read from Zustand)
  ai/                   # AIInsightButton, DashboardSummary, AnomalyAlerts

store/
  dashboardStore.ts     # All dashboard data + getFilteredData selector
  filterStore.ts        # dateRange, activePlatforms + actions

types/index.ts          # All Zod schemas + inferred TypeScript types
data/mockData.ts        # Full typed March 2026 reference dataset
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI features | Anthropic API key (claude-haiku-4-5 + claude-sonnet-4-6) |

