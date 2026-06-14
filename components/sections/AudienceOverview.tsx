"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { formatCompact, formatMoM, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, UserPlus, Eye, Activity, FileText } from "lucide-react";

const KPI_CONFIG = [
  { key: "totalFollowers",      label: "Total Followers",       icon: Users,      format: (v: number) => v.toLocaleString("en-IN") },
  { key: "followerGrowth",      label: "Follower Growth (MTM)", icon: UserPlus,   format: (v: number) => `+${v.toLocaleString("en-IN")}` },
  { key: "totalReach",          label: "Total Reach (Mar)",     icon: Eye,        format: (v: number) => `${(v/1_000_000).toFixed(2)}M` },
  { key: "avgEngagementRate",   label: "Avg Engagement Rate",   icon: Activity,   format: (v: number) => `${v}%` },
  { key: "contentPublished",    label: "Content Published",     icon: FileText,   format: (v: number, kpi: Record<string, unknown>) => {
    const c = kpi.contentByPlatform as { instagram: number; youtube: number; facebook: number };
    return `${v}\n${c.instagram} IG · ${c.youtube} YT · ${c.facebook} FB`;
  }},
] as const;

export function AudienceOverview() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);
  const kpi = filtered.kpi;

  return (
    <section className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Audience Overview
        </h2>
        <AIInsightButton section="Audience Overview" data={kpi} />
      </div>

      <div className="grid grid-cols-5 gap-3">
        {KPI_CONFIG.map(({ key, label, icon: Icon, format }) => {
          const value = kpi[key as keyof typeof kpi] as number;
          const momKey = key as keyof typeof kpi.mom;
          const mom = kpi.mom[momKey as keyof typeof kpi.mom] as number | undefined;
          const isPositive = mom !== undefined ? mom > 0 : true;
          const isContent = key === "contentPublished";

          const formatted = format(value, kpi as unknown as Record<string, unknown>);
          const lines = formatted.split("\n");

          return (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground font-medium leading-tight">{label}</p>
                <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{lines[0]}</p>
                {lines[1] && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{lines[1]}</p>
                )}
              </div>

              {mom !== undefined && !isContent && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-semibold w-fit px-1.5 py-0.5 rounded-md",
                    isPositive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatMoM(mom)} vs last month
                </div>
              )}

              {isContent && (
                <div className="h-6 flex items-end">
                  <div className="flex gap-0.5 w-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-muted/80"
                        style={{ height: `${8 + Math.random() * 12}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
