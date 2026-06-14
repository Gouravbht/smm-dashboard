"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ContentPost } from "@/types";
import { ArrowUpDown, ArrowUp, ArrowDown, AtSign, MoreVertical } from "lucide-react";
import { InstagramIcon as Instagram, YoutubeIcon as Youtube, FacebookIcon as Facebook } from "@/components/ui/brand-icons";

type SortKey = keyof Pick<ContentPost, "likes" | "comments" | "shares" | "saves" | "reach" | "engagementRate">;
type SortDir = "asc" | "desc";
type Tab = "All" | "Instagram" | "Youtube" | "Facebook";
type IconType = React.ComponentType<{ className?: string }>;

const TABS: { key: Tab; icon: IconType }[] = [
  { key: "All", icon: AtSign },
  { key: "Instagram", icon: Instagram },
  { key: "Youtube", icon: Youtube },
  { key: "Facebook", icon: Facebook },
];

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  instagram: { label: "IG", cls: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400" },
  youtube:   { label: "YT", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
  facebook:  { label: "FB", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
};

const COLS: { key: SortKey; label: string; sub?: string }[] = [
  { key: "likes",          label: "Likes / Reactions", sub: "Reactions on FB" },
  { key: "comments",       label: "Comments" },
  { key: "shares",         label: "Shares", sub: "Reels & Stories only on IG" },
  { key: "saves",          label: "Saves", sub: "IG only" },
  { key: "reach",          label: "Reach" },
  { key: "engagementRate", label: "Eng.%" },
];

function cell(v: number) {
  return v === -1 ? <span className="text-muted-foreground/40 italic">N/A</span> : v.toLocaleString("en-IN");
}

export function ContentPerformance() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { contentPosts } = getFilteredData(activePlatforms);

  const [sortKey, setSortKey] = useState<SortKey>("engagementRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [tab, setTab] = useState<Tab>("All");

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const tabbed = contentPosts.filter((p) => (tab === "All" ? true : p.platform === tab.toLowerCase()));
  const sorted = [...tabbed].sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <Section label="Content Performance">
      <Panel>
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">All Posts — Engagement Detail</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Likes · Comments · Shares · Saves · Reach · Engagement rate · March 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <AIInsightButton section="Content Performance" data={contentPosts} />
            <button className="text-muted-foreground/50 hover:text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 mb-3">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                tab === key ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}
            >
              <Icon className="w-3.5 h-3.5" />
              {key}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-y border-border">
                <th className="text-left font-medium text-muted-foreground px-5 py-2.5">Post</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Platform</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Type</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Date</th>
                {COLS.map(({ key, label, sub }) => (
                  <th key={key} className="text-right font-medium text-muted-foreground px-3 py-2.5 cursor-pointer hover:text-foreground select-none" onClick={() => toggle(key)}>
                    <div className="flex items-center justify-end gap-1">{label}<SortIcon col={key} /></div>
                    {sub && <p className="text-[9px] font-normal text-muted-foreground/40 normal-case">{sub}</p>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => {
                const badge = PLATFORM_BADGE[post.platform];
                return (
                  <tr key={post.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-foreground whitespace-nowrap">{post.title}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", badge.cls)}>{badge.label}</span>
                        <span className="text-[11px] text-muted-foreground">@rarefitness</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{post.type}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{post.date}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-foreground">{cell(post.likes)}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{cell(post.comments)}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{cell(post.shares)}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{cell(post.saves)}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">{post.reach.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-foreground">{post.engagementRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <AICallout>
          <strong className="text-foreground">Instagram Reels drive 3× higher engagement rate</strong> than static posts and 2.5× vs YouTube videos. Client testimonial content outperforms educational content across all platforms. Saves (IG-only metric via Meta Graph API) are a strong intent signal — 620 saves on the testimonial Reel indicates high purchase-intent audience.
        </AICallout>
      </Panel>
    </Section>
  );
}
