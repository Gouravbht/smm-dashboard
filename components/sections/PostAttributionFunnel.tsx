"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const STAGE_COLORS = [
  "bg-indigo-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-green-500",
];

const STAGE_BG = [
  "bg-indigo-500/10 border-indigo-500/20",
  "bg-blue-500/10 border-blue-500/20",
  "bg-cyan-500/10 border-cyan-500/20",
  "bg-teal-500/10 border-teal-500/20",
  "bg-emerald-500/10 border-emerald-500/20",
  "bg-green-500/10 border-green-500/20",
];

const STAGE_TEXT = [
  "text-indigo-400",
  "text-blue-400",
  "text-cyan-400",
  "text-teal-400",
  "text-emerald-400",
  "text-green-400",
];

export function PostAttributionFunnel() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);
  const funnel = filtered.attributionFunnel;

  const maxCount = funnel[1].count; // Impressions is the widest stage

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Raw Attribution Log
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Post-to-Lead Conversion Flow — March 2026</p>
          <p className="text-[10px] text-muted-foreground/60">Social post → UTM link → Landing page → Form → Lead captured · tracked via GA4 + UTM parameters</p>
        </div>
        <AIInsightButton section="Post Attribution Funnel" data={funnel} />
      </div>

      {/* Funnel Cards Row */}
      <div className="flex items-start gap-0">
        {funnel.map((stage, i) => {
          const width = i === 0 ? 48 : Math.max(30, (stage.count / funnel[0].count) * 100);
          return (
            <div key={stage.stage} className="flex items-center flex-1">
              <div
                className={cn(
                  "rounded-xl border p-3 flex flex-col gap-1 w-full",
                  STAGE_BG[i]
                )}
              >
                <p className={cn("text-xl font-black", STAGE_TEXT[i])}>
                  {stage.count >= 1_000
                    ? `${(stage.count / 1_000).toFixed(stage.count >= 100_000 ? 0 : 1)}k`
                    : stage.count}
                </p>
                <p className="text-[10px] font-semibold text-foreground leading-tight">{stage.stage}</p>
                {stage.rate && (
                  <p className="text-[10px] text-muted-foreground">{stage.rate}</p>
                )}
              </div>
              {i < funnel.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Funnel visualization bars */}
      <div className="mt-4 space-y-1">
        {funnel.map((stage, i) => {
          const pct = i === 0 ? 100 : (stage.count / funnel[0].count) * 100;
          return (
            <div key={stage.stage} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-36 shrink-0 truncate">{stage.stage}</span>
              <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden relative">
                <div
                  className={cn("h-full rounded-sm transition-all duration-700 flex items-center pl-2", STAGE_COLORS[i])}
                  style={{ width: `${pct}%` }}
                >
                  <span className="text-[9px] font-bold text-white">
                    {stage.count >= 1_000 ? `${(stage.count / 1_000).toFixed(1)}k` : stage.count}
                  </span>
                </div>
              </div>
              {stage.rate && (
                <span className="text-[10px] text-muted-foreground w-24 shrink-0 text-right">{stage.rate}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <span className="text-indigo-400 font-bold shrink-0">✦</span>
        <p>
          <strong className="text-foreground">Instagram Reels → lead conversion rate: 8.1%</strong> (of link impressions → clicks). The biggest drop is at Link Clicks (only 0.93% of impressions click) — bio link + story swipe-up are the primary paths. Form completion 61% is strong once users reach the form. UTM parameters tracked via GA4 source/instagram, medium=social, campaign=reels.
        </p>
      </div>
    </section>
  );
}
