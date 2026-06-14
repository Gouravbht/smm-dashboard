"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { platformColor, platformLabel } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const PLATFORMS = ["instagram", "youtube", "facebook"] as const;

function formatY(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

export function AudienceGrowth() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Audience Growth
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cumulative Follower Growth — Apr 2025 to Mar 2026
          </p>
          <p className="text-[10px] text-muted-foreground/60">Instagram · YouTube · Facebook · monthly totals</p>
        </div>
        <AIInsightButton section="Audience Growth" data={filtered.audienceGrowth} />
      </div>

      <div className="h-52 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered.audienceGrowth} margin={{ top: 5, right: 64, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
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
            {PLATFORMS.filter((p) => activePlatforms.includes(p)).map((platform) => (
              <Line
                key={platform}
                type="monotone"
                dataKey={platform}
                stroke={platformColor(platform)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              >
                <LabelList
                  dataKey={platform}
                  position="right"
                  formatter={(v: unknown) => {
                    // Only show label on the last data point
                    return typeof v === "number" ? v.toLocaleString("en-IN") : "";
                  }}
                  content={(props) => {
                    const { x, y, value, index } = props as { x: number; y: number; value: number; index: number };
                    // Only render on last point (index 11 = March)
                    if (index !== 11) return null;
                    return (
                      <text
                        x={(x ?? 0) + 6}
                        y={(y ?? 0) + 4}
                        fontSize={10}
                        fontWeight={600}
                        fill={platformColor(platform)}
                      >
                        {typeof value === "number" ? value.toLocaleString("en-IN") : ""}
                      </text>
                    );
                  }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Auto-insight callout matching reference */}
      <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <span className="text-indigo-400 font-bold shrink-0">✦</span>
        <p>
          <strong className="text-foreground">Instagram grew fastest</strong> — 25.6% total growth over 12 months, driven by Reel engagement in Q3 and Q4.
          YouTube grew steadily (+22.3%) but from a smaller base. Facebook growth is slowing (+16.7%) — organic reach
          declining, AI-assisted growth recommended.
        </p>
      </div>
    </section>
  );
}
