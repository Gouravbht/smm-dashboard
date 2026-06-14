"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { platformColor, platformLabel } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

export function VideoCompletion() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Video Completion Rate
        </h2>
        <AIInsightButton section="Video Completion" data={{ completion: filtered.videoCompletion, dropOff: filtered.dropOffCurve }} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Completion bars */}
        <div>
          <p className="text-xs font-medium text-foreground mb-1">Avg Completion Rate by Platform</p>
          <p className="text-[10px] text-muted-foreground mb-4">How much of each video viewers watch on average</p>

          <div className="space-y-4">
            {filtered.videoCompletion.map((v) => {
              const color = platformColor(v.platform);
              return (
                <div key={v.platform}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-xs text-foreground font-medium">{v.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{v.completionRate}%</span>
                      <p className="text-[10px] text-muted-foreground">
                        {v.platform === "instagram" && "88% avg of 5%"}
                        {v.platform === "youtube" && "27% avg of 5:00"}
                        {v.platform === "facebook" && "38% estimated / 3 mins"}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${v.completionRate}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-indigo-400 font-bold mr-1">✦</span>
            Instagram Reels retain the most audience — 88% avg completion on short-form content. YouTube mid-roll drop-off occurs at the 50% mark. Facebook video completion data is not reliably available — only 3-second and 30-second views are returned.
          </div>
        </div>

        {/* YouTube drop-off curve */}
        <div>
          <p className="text-xs font-medium text-foreground mb-1">YouTube Drop-off — Retention Curve</p>
          <p className="text-[10px] text-muted-foreground mb-4">Avg audience retention · 5:00 video · 14 videos averaged</p>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dropOffCurve} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="ytGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(v) => [`${v}%`, "Retention"]}
                />
                <ReferenceLine
                  x="2:30"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 2"
                  label={{ value: "60% drop", position: "top", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <ReferenceLine
                  y={44}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 2"
                  label={{ value: "44% avg", position: "right", fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="retention"
                  stroke="#FF0000"
                  strokeWidth={2}
                  fill="url(#ytGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-indigo-400 font-bold mr-1">✦</span>
            Significant drop-off between 1:15–2:30 suggests the hook or mid-video pacing needs work. Videos under 2 min show 68% completion — consider splitting long content into shorter episodes.
          </div>
        </div>
      </div>
    </section>
  );
}
