"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { platformColor, platformLabel, cn } from "@/lib/utils";
import { useState } from "react";
import type { ContentPost } from "@/types";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = keyof Pick<ContentPost, "likes" | "comments" | "shares" | "saves" | "reach" | "engagementRate">;
type SortDir = "asc" | "desc";

const PLATFORM_BADGE_STYLE: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  youtube: "bg-red-500/10 text-red-400 border border-red-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

const TYPE_STYLE: Record<string, string> = {
  Reel: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Static: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  Video: "bg-red-500/10 text-red-400 border border-red-500/20",
  Carousel: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const COLS: { key: SortKey; label: string }[] = [
  { key: "likes",          label: "Likes / Reactions" },
  { key: "comments",       label: "Comments" },
  { key: "shares",         label: "Shares" },
  { key: "saves",          label: "Saves" },
  { key: "reach",          label: "Reach" },
  { key: "engagementRate", label: "Eng. %" },
];

export function ContentPerformance() {
  const { data, getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const filtered = getFilteredData(activePlatforms);

  const [sortKey, setSortKey] = useState<SortKey>("engagementRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...filtered.contentPosts].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-400" />;
  };

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Content Performance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All Posts — Engagement Detail
          </p>
          <p className="text-[10px] text-muted-foreground/60">Likes · Comments · Shares · Saves · Reach · Engagement rate · March 2026</p>
        </div>
        <AIInsightButton section="Content Performance" data={filtered.contentPosts} />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">POST</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">PLATFORM</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">TYPE</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium">DATE</th>
              {COLS.map(({ key, label }) => (
                <th key={key} className="text-right px-3 py-2.5 text-muted-foreground font-medium cursor-pointer hover:text-foreground" onClick={() => toggle(key)}>
                  <div className="flex items-center justify-end gap-1">
                    {label}
                    <SortIcon col={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((post, i) => (
              <tr
                key={post.id}
                className={cn(
                  "border-t border-border hover:bg-muted/30 transition-colors",
                  i % 2 === 0 ? "" : "bg-muted/10"
                )}
              >
                <td className="px-3 py-2.5 font-medium text-foreground max-w-[180px] truncate">
                  {post.title}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", PLATFORM_BADGE_STYLE[post.platform])}>
                    {platformLabel(post.platform)}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", TYPE_STYLE[post.type])}>
                    {post.type}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{post.date}</td>
                <td className="px-3 py-2.5 text-right font-medium text-foreground">{post.likes.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{post.comments.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{post.shares.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{post.saves.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5 text-right text-foreground">{post.reach.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={cn(
                    "font-semibold",
                    post.engagementRate >= 5 ? "text-green-400" :
                    post.engagementRate >= 3 ? "text-amber-400" : "text-muted-foreground"
                  )}>
                    {post.engagementRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex gap-2">
        <span className="text-indigo-400 font-bold shrink-0">✦</span>
        <p>
          <strong className="text-foreground">Reels drive 3× higher engagement</strong> vs static posts and 2.5× vs YouTube videos. Client testimonial content outperforms educational content across all platforms. Saves (IG-only metric via Meta Graph API) are a strong intent signal — 842 saves on the testimonial Reel indicates high purchase-intent audience.
        </p>
      </div>
    </section>
  );
}
