"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { platformColor, platformLabel, cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useState } from "react";

type TabFilter = "All" | "Instagram" | "YouTube" | "Facebook";
const TABS: TabFilter[] = ["All", "Instagram", "YouTube", "Facebook"];

function formatY(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

export function WeeklyReach() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);
  const [tab, setTab] = useState<TabFilter>("All");

  const chartData = filtered.weeklyReach.map((w) => {
    if (tab === "All") return w;
    const key = tab.toLowerCase() as "instagram" | "youtube" | "facebook";
    return { week: w.week, [key]: w[key], total: w[key] };
  });

  const showPlatforms =
    tab === "All"
      ? (["instagram", "youtube", "facebook"] as const).filter((p) => activePlatforms.includes(p))
      : [tab.toLowerCase() as "instagram" | "youtube" | "facebook"];

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Reach & Impressions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Weekly Reach by Platform — March 2026</p>
          <p className="text-[10px] text-muted-foreground/60">Stacked reach: Instagram + YouTube + Facebook</p>
        </div>
        <AIInsightButton section="Weekly Reach" data={filtered.weeklyReach} />
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
              tab === t
                ? "bg-foreground text-background border-transparent"
                : "text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {t !== "All" && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: platformColor(t.toLowerCase()) }}
              />
            )}
            {t}
          </button>
        ))}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatY}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value, name) => [
                typeof value === "number" ? value.toLocaleString("en-IN") : value,
                platformLabel(String(name)),
              ]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                  {platformLabel(value)}
                </span>
              )}
            />
            {showPlatforms.map((platform, idx) => (
              <Bar
                key={platform}
                dataKey={platform}
                stackId="a"
                fill={platformColor(platform)}
                radius={idx === showPlatforms.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              >
                {idx === showPlatforms.length - 1 && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(v: unknown) => typeof v === "number" ? `${(v / 1000).toFixed(1)}k` : ""}
                    style={{ fontSize: "10px", fill: "hsl(var(--muted-foreground))" }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <span className="text-indigo-400 font-bold shrink-0">✦</span>
        <p>
          <strong className="text-foreground">Week 2 (Mar 8–14) was peak reach at 74,600</strong> — aligned with the Quality Life Plan Carousel launch and a high-engagement Reel. Week 4 dip reflects end-of-month reduced posting cadence. Instagram consistently drives 55–60% of total weekly reach.
        </p>
      </div>
    </section>
  );
}
