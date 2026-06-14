"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section } from "@/components/layout/Section";
import { PlatformSkeletons } from "@/components/ui/Skeleton";
import { ArrowUp, Check } from "lucide-react";
import { InstagramIcon, YoutubeIcon, FacebookIcon } from "@/components/ui/brand-icons";
import { platformColor } from "@/lib/utils";
import type { PlatformMetrics } from "@/types";
import { useState, useEffect } from "react";

const ICONS = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
} as const;

function PlatformCard({ p }: { p: PlatformMetrics }) {
  const Icon = ICONS[p.platform];
  const color = platformColor(p.platform);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color }}>
            <Icon className="text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-foreground leading-tight">{p.name}</p>
            <p className="text-[11px] text-muted-foreground">{p.handle}</p>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground">{p.postsLabel}</span>
      </div>

      {/* Metrics grid: 2 rows × 3 */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-4">
        {p.metrics.map((m, i) => (
          <div key={i}>
            <p className="text-[19px] font-bold text-foreground leading-none tracking-tight">{m.value}</p>

            {m.delta && (
              <div className="flex items-center gap-0.5 mt-1">
                <ArrowUp className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
                <span className="text-[10px] font-semibold text-emerald-500">{m.delta}</span>
              </div>
            )}
            {m.sub && <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>}

            <div className="flex items-center gap-1 mt-1">
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</p>
              {m.check && <Check className="w-2.5 h-2.5 text-muted-foreground/50" strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformBreakdown() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { platforms } = getFilteredData(activePlatforms);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Section
      label="Platform Breakdown"
      action={<AIInsightButton section="Platform Breakdown" data={platforms} />}
    >
      {!loaded ? (
        <PlatformSkeletons />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <PlatformCard key={p.platform} p={p} />
          ))}
        </div>
      )}
    </Section>
  );
}
