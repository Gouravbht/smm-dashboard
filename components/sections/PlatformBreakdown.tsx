"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { platformColor, platformLabel, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PlatformMetrics } from "@/types";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  youtube: "▶",
  facebook: "f",
};

const PLATFORM_POSTS_LABEL: Record<string, string> = {
  instagram: "posts",
  youtube: "videos",
  facebook: "posts",
};

function MoMBadge({ value }: { value: number }) {
  if (value === undefined || value === null) return null;
  const pos = value > 0;
  return (
    <span className={cn(
      "text-[10px] font-semibold flex items-center gap-0.5",
      pos ? "text-green-400" : "text-red-400"
    )}>
      {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {pos ? "+" : ""}{value}%
    </span>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col">
      <p className="text-base font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function PlatformCard({ p }: { p: PlatformMetrics }) {
  const color = platformColor(p.platform);
  const postsLabel = PLATFORM_POSTS_LABEL[p.platform];

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: color }}
          >
            {PLATFORM_ICONS[p.platform]}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{platformLabel(p.platform)}</p>
            <p className="text-[10px] text-muted-foreground">{p.handle}</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">{p.posts} {postsLabel}</span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3 py-2 border-y border-border">
        <div>
          <p className="text-lg font-bold text-foreground">
            {p.followers >= 1_000 ? `${(p.followers / 1000).toFixed(0)},${String(p.followers % 1000).padStart(3, "0")}` : p.followers}
          </p>
          <div className="flex items-center gap-1">
            <MoMBadge value={p.followersMoM} />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            {p.platform === "youtube" ? "SUBSCRIBERS" : "FOLLOWERS"}
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            {p.reach >= 1_000 ? `${(p.reach / 1000).toFixed(0)},${String(p.reach % 1000).padStart(3, "0")}` : p.reach}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">REACH (MAR)</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{p.engagementRate}%</p>
          <div className="flex items-center gap-1">
            <MoMBadge value={p.engRateMoM} />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">ENG. RATE</p>
        </div>
      </div>

      {/* Platform-specific metrics */}
      <div className="grid grid-cols-3 gap-3">
        {p.platform === "instagram" && (
          <>
            <MetricRow label="LIKES" value={p.likes.toLocaleString("en-IN")} sub="+14%" />
            <MetricRow label="COMMENTS" value={p.comments.toLocaleString("en-IN")} sub="+48%" />
            <MetricRow label="SAVES" value={(p.saves ?? 0).toLocaleString("en-IN")} />
          </>
        )}
        {p.platform === "youtube" && (
          <>
            <MetricRow label="WATCH TIME" value={p.watchTime ?? "—"} />
            <MetricRow label="AVG DURATION" value={p.avgDuration ?? "—"} />
            <MetricRow label="COMMENTS" value={(p.comments ?? 0).toLocaleString("en-IN")} sub="+17%" />
          </>
        )}
        {p.platform === "facebook" && (
          <>
            <MetricRow label="REACTIONS" value={(p.reactions ?? 0).toLocaleString("en-IN")} sub="+46%" />
            <MetricRow label="COMMENTS" value={p.comments.toLocaleString("en-IN")} sub="+14%" />
            <MetricRow label="SHARES" value={(p.shares ?? 0).toLocaleString("en-IN")} sub="+44%" />
          </>
        )}
      </div>
    </div>
  );
}

export function PlatformBreakdown() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Platform Breakdown
        </h2>
        <AIInsightButton section="Platform Breakdown" data={filtered.platforms} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.platforms.map((p) => (
          <PlatformCard key={p.platform} p={p} />
        ))}
      </div>
    </section>
  );
}
