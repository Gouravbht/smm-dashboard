"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { platformColor, platformLabel } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";

const PLATFORMS = ["instagram", "youtube", "facebook"] as const;

function formatY(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

export function AudienceGrowth() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { audienceGrowth } = getFilteredData(activePlatforms);
  const visible = PLATFORMS.filter((p) => activePlatforms.includes(p));

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
            <LineChart data={audienceGrowth} margin={{ top: 10, right: 70, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} domain={[0, 20000]} ticks={[0, 5000, 10000, 15000, 20000]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))" }}
                formatter={(value, name) => [typeof value === "number" ? value.toLocaleString("en-IN") : value, platformLabel(String(name))]}
              />
              <Legend formatter={(value) => <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{platformLabel(value)}</span>} iconType="plainline" />
              {visible.map((platform) => (
                <Line key={platform} type="monotone" dataKey={platform} stroke={platformColor(platform)} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }}>
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
