"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { platformColor, platformLabel } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { PREV_YEAR_GROWTH } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from "recharts";

const PLATFORMS = ["instagram", "youtube", "facebook"] as const;

function formatY(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

export function AudienceGrowth() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms, showMoM } = useFilterStore();
  const { audienceGrowth } = getFilteredData(activePlatforms);
  const visible = PLATFORMS.filter((p) => activePlatforms.includes(p));

  // Merge current + prev year into one dataset for Recharts when showMoM is on
  const chartData = audienceGrowth.map((point, i) => ({
    ...point,
    ...(showMoM
      ? {
          instagram_prev: PREV_YEAR_GROWTH[i]?.instagram ?? 0,
          youtube_prev:   PREV_YEAR_GROWTH[i]?.youtube   ?? 0,
          facebook_prev:  PREV_YEAR_GROWTH[i]?.facebook  ?? 0,
        }
      : {}),
  }));

  return (
    <Section label="Audience Growth">
      <Panel>
        <div className="flex items-start justify-between px-5 pt-5 pb-2">
          <div>
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">
              Cumulative Follower Growth — Apr 2025 to Mar 2026
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Instagram · YouTube · Facebook · monthly totals
              {showMoM && (
                <span className="ml-1.5 text-indigo-500 dark:text-indigo-400 font-medium">
                  · dashed = Apr 2024–Mar 2025
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AIInsightButton section="Audience Growth" data={audienceGrowth} />
            <button className="text-muted-foreground/50 hover:text-muted-foreground">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-72 px-3 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 70, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} domain={[0, 20000]} ticks={[0, 5000, 10000, 15000, 20000]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))" }}
                formatter={(value, name) => {
                  const isPrev = String(name).endsWith("_prev");
                  const base = String(name).replace("_prev", "");
                  const label = `${platformLabel(base)}${isPrev ? " (prev yr)" : ""}`;
                  return [typeof value === "number" ? value.toLocaleString("en-IN") : value, label];
                }}
              />
              <Legend
                formatter={(value) => {
                  const isPrev = String(value).endsWith("_prev");
                  const base = String(value).replace("_prev", "");
                  return (
                    <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", opacity: isPrev ? 0.5 : 1 }}>
                      {platformLabel(base)}{isPrev ? " (prev yr)" : ""}
                    </span>
                  );
                }}
                iconType="plainline"
              />

              {/* Current year lines */}
              {visible.map((platform) => (
                <Line
                  key={platform}
                  type="monotone"
                  dataKey={platform}
                  stroke={platformColor(platform)}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                >
                  <LabelList
                    dataKey={platform}
                    content={(props) => {
                      const { x, y, value, index } = props as { x: number; y: number; value: number; index: number };
                      if (index !== audienceGrowth.length - 1) return null;
                      return (
                        <text x={(x ?? 0) + 8} y={(y ?? 0) + 4} fontSize={12} fontWeight={700} fill={platformColor(platform)}>
                          {typeof value === "number" ? value.toLocaleString("en-IN") : ""}
                        </text>
                      );
                    }}
                  />
                </Line>
              ))}

              {/* Previous year ghost lines — shown only when showMoM is active */}
              {showMoM && visible.map((platform) => (
                <Line
                  key={`${platform}_prev`}
                  type="monotone"
                  dataKey={`${platform}_prev`}
                  stroke={platformColor(platform)}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  strokeOpacity={0.4}
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <AICallout>
          <strong className="text-foreground">Instagram grew fastest</strong> — 29.6% total growth over 12 months, driven by Reel engagement in Q3 and Q4. YouTube grew steadily (+32.3%) but from a smaller base. Facebook growth is slowing (+16.7%) — organic reach declining, ad-assisted growth recommended.
        </AICallout>
      </Panel>
    </Section>
  );
}
