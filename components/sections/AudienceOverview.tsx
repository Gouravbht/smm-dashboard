"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/utils";

interface KpiCard {
  label: string;
  value: string;
  badge?: string;
  sub?: string;
  trend: number[];
}

function Sparkline({ points }: { points: number[] }) {
  const w = 200;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((p - min) / range) * (h - 6) - 3}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-9">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/30" />
    </svg>
  );
}

export function AudienceOverview() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { kpi } = getFilteredData(activePlatforms);

  const cards: KpiCard[] = [
    { label: "Total Followers",       value: kpi.totalFollowers.toLocaleString("en-IN"), badge: `+${kpi.mom.totalFollowers}%`, trend: [30, 32, 33, 35, 36, 38, 40, 42, 44, 46, 48, 52] },
    { label: "Follower Growth (MTM)", value: `+${kpi.followerGrowth}`, badge: `+${kpi.mom.followerGrowth}%`, trend: [20, 24, 22, 28, 26, 32, 30, 36, 34, 40, 44, 48] },
    { label: "Total Reach (Mar)",     value: kpi.totalReach.toLocaleString("en-IN"), badge: `+${kpi.mom.totalReach}%`, trend: [25, 28, 26, 30, 34, 31, 36, 33, 38, 42, 40, 46] },
    { label: "Avg Engagement Rate",   value: `${kpi.avgEngagementRate}%`, badge: `+${kpi.mom.avgEngagementRate}%`, trend: [22, 24, 23, 26, 25, 28, 27, 30, 29, 31, 30, 33] },
    { label: "Content Published",     value: `${kpi.contentPublished}`, sub: `${kpi.contentByPlatform.instagram} IG · ${kpi.contentByPlatform.youtube} YT · ${kpi.contentByPlatform.facebook} FB`, trend: [38, 30, 42, 28, 44, 36, 32, 40, 34, 46, 30, 42] },
  ];

  return (
    <Section label="Audience Overview">
      <div className="flex items-center justify-end -mt-7 mb-2">
        <AIInsightButton section="Audience Overview" data={kpi} />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col">
            <p className="text-[12px] text-muted-foreground font-medium">{card.label}</p>
            <p className="text-[26px] font-bold text-foreground tracking-tight mt-1 leading-none">{card.value}</p>

            {card.badge ? (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {card.badge}
                </span>
                <span className="text-[10px] text-muted-foreground">vs last month</span>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-2">{card.sub}</p>
            )}

            <div className="mt-3 -mb-1">
              <Sparkline points={card.trend} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
