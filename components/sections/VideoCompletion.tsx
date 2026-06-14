"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { platformColor } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";

const COMPLETION_META: Record<string, { source: string; detail: string; estimated?: boolean }> = {
  instagram: { source: "Meta Graph API · video_insights", detail: "25s avg of 37s" },
  youtube:   { source: "YouTube Analytics API · audienceRetention", detail: "2:10 avg of 5:00" },
  facebook:  { source: "Meta Graph API · partial data only", detail: "estimated", estimated: true },
};

export function VideoCompletion() {
  const { getFilteredData, data } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { videoCompletion } = getFilteredData(activePlatforms);

  return (
    <Section label="Video Completion Rate">
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT: completion bars */}
        <Panel className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-1">
            <div>
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Avg Completion Rate by Platform</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">How much of each video viewers watch on average</p>
            </div>
            <AIInsightButton section="Video Completion" data={{ completion: videoCompletion }} />
          </div>

          <div className="px-5 py-4 space-y-5">
            {videoCompletion.map((v) => {
              const meta = COMPLETION_META[v.platform];
              const color = platformColor(v.platform);
              return (
                <div key={v.platform}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{v.label}</p>
                      <p className="text-[10px] text-muted-foreground">{meta.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-bold text-foreground">{meta.estimated ? "~" : ""}{v.completionRate}%</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        {meta.estimated && <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />}
                        {meta.estimated ? "limited" : meta.detail}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${v.completionRate}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <AICallout>
            Instagram Reels retain the most audience — 68% avg completion on short-form content. YouTube mid-roll drop-off occurs at the 50% mark. Facebook video completion data is not reliably available via Meta Graph API — only 3-second and 30-second views are returned; full completion rate requires manual Facebook Insights export.
          </AICallout>
        </Panel>

        {/* RIGHT: retention curve */}
        <Panel className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-1">
            <div>
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">YouTube Drop-off — Retention Curve</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Avg audience retention · 5:00 video · YouTube Analytics API</p>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">14 videos averaged</span>
          </div>

          <div className="h-56 px-3 py-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dropOffCurve} margin={{ top: 16, right: 40, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} ticks={["0:00", "1:15", "2:30", "3:45", "5:00"]} interval="preserveStartEnd" dy={4} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={36} ticks={[25, 50, 75, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))" }} formatter={(v) => [`${v}%`, "Retention"]} />
                <ReferenceLine x="2:30" stroke="#ef4444" strokeDasharray="4 3" label={{ value: "50% drop at 2:30", position: "top", fontSize: 10, fill: "#ef4444", fontWeight: 600 }} />
                <ReferenceLine y={44} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" label={{ value: "44% avg", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Area type="monotone" dataKey="retention" stroke="hsl(var(--foreground))" strokeWidth={2.5} fill="url(#ytGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <AICallout>
            Significant drop-off between 1:15–2:30 suggests the hook or mid-video pacing needs work. Videos under 2 min show 68% completion — consider splitting long content into shorter episodes.
          </AICallout>
        </Panel>
      </div>
    </Section>
  );
}
