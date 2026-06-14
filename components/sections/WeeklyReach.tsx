"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { platformColor, platformLabel, cn } from "@/lib/utils";
import { AtSign, MoreVertical } from "lucide-react";
import { InstagramIcon as Instagram, YoutubeIcon as Youtube, FacebookIcon as Facebook } from "@/components/ui/brand-icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from "recharts";
import { useState } from "react";

type Tab = "All" | "Instagram" | "Youtube" | "Facebook";
type IconType = React.ComponentType<{ className?: string }>;
const TABS: { key: Tab; icon: IconType }[] = [
  { key: "All", icon: AtSign },
  { key: "Instagram", icon: Instagram },
  { key: "Youtube", icon: Youtube },
  { key: "Facebook", icon: Facebook },
];

// Stack order bottom→top matches reference: YouTube (red) base, Instagram (pink), Facebook (blue)
const STACK_ORDER = ["youtube", "instagram", "facebook"] as const;

function formatY(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
}

export function WeeklyReach() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { weeklyReach } = getFilteredData(activePlatforms);
  const [tab, setTab] = useState<Tab>("All");

  const showPlatforms =
    tab === "All"
      ? STACK_ORDER.filter((p) => activePlatforms.includes(p))
      : [tab.toLowerCase() as "instagram" | "youtube" | "facebook"];

  return (
    <Section label="Reach & Impressions">
      <Panel>
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">Weekly Reach by Platform — March 2026</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Stacked reach: Instagram + YouTube + Facebook · Meta Graph API + YouTube Data API v3</p>
          </div>
          <div className="flex items-center gap-2">
            <AIInsightButton section="Weekly Reach" data={weeklyReach} />
            <button className="text-muted-foreground/50 hover:text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 mb-2">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                tab === key ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {key}
            </button>
          ))}
        </div>

        <div className="h-72 px-3 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyReach} margin={{ top: 24, right: 16, left: 8, bottom: 8 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tickFormatter={formatY} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} domain={[0, 80000]} ticks={[0, 20000, 40000, 60000, 80000]} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px", color: "hsl(var(--foreground))" }}
                formatter={(value, name) => [typeof value === "number" ? value.toLocaleString("en-IN") : value, platformLabel(String(name))]}
              />
              <Legend formatter={(value) => <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{platformLabel(value)}</span>} />
              {showPlatforms.map((platform, idx) => (
                <Bar key={platform} dataKey={platform} stackId="a" fill={platformColor(platform)} radius={idx === showPlatforms.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} maxBarSize={90}>
                  {idx === showPlatforms.length - 1 && (
                    <LabelList dataKey="total" position="top" formatter={(v: unknown) => typeof v === "number" ? `${(v / 1000).toFixed(1)}k` : ""} style={{ fontSize: "12px", fontWeight: 700, fill: "hsl(var(--foreground))" }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <AICallout>
          <strong className="text-foreground">Week 2 (Mar 8–14) was peak reach at 74,600</strong> — aligned with the Quality Life Plan Carousel launch and a high-engagement Reel. Week 4 dip reflects end-of-month reduced posting cadence. Instagram consistently drives 55–60% of total weekly reach.
        </AICallout>
      </Panel>
    </Section>
  );
}
