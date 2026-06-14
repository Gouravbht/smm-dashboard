"use client";

import { useFilterStore } from "@/store/filterStore";
import { cn, platformLabel } from "@/lib/utils";
import type { Platform } from "@/types";
import { Calendar, Clock, AtSign, CheckCircle2, ChevronDown, Check, ArrowLeftRight } from "lucide-react";
import { useState } from "react";

const DATE_PRESETS = [
  { label: "Mar 1 – Mar 31", start: "2026-03-01", end: "2026-03-31" },
  { label: "Last 7 days",    start: "2026-03-24", end: "2026-03-31" },
  { label: "Last 90 days",   start: "2026-01-01", end: "2026-03-31" },
  { label: "Last 6 months",  start: "2025-10-01", end: "2026-03-31" },
  { label: "Last 12 months", start: "2025-04-01", end: "2026-03-31" },
];

const PLATFORMS: Platform[] = ["instagram", "youtube", "facebook"];

function Pill({
  icon: Icon, label, children, open, onToggle, active,
}: {
  icon: typeof Calendar;
  label: string;
  children?: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  active?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12.5px] font-medium transition-colors",
          active
            ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
            : "bg-card border-border text-foreground hover:bg-muted"
        )}
      >
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
      </button>
      {open && children && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-popover border border-border rounded-xl shadow-xl p-1.5 min-w-[200px]">
          {children}
        </div>
      )}
    </div>
  );
}

export function PageTitle() {
  const { dateRange, setDateRange, activePlatforms, togglePlatform, setAllPlatforms, showMoM, toggleMoM } = useFilterStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggle = (m: string) => setOpenMenu((cur) => (cur === m ? null : m));

  const platformLabelText =
    activePlatforms.length === 3 ? "All Platforms"
    : activePlatforms.map((p) => platformLabel(p)).join(", ");

  return (
    <div className="px-4 sm:px-6 pt-5">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-foreground tracking-tight">Social Media</h1>
          <p className="text-[12.5px] text-muted-foreground mt-1 flex items-center gap-2">
            Rare Fitness social media performance across different brand social channels.
            {/* Pulsing live sync indicator */}
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
              <span className="text-muted-foreground/60">· Last synced 10 Mar 2026, 10:03pm</span>
            </span>
          </p>
        </div>
        <button className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-background">
            <path d="M12 2l1.9 5.8L20 9.7l-4.9 3.6L17 19l-5-3.6L7 19l1.9-5.7L4 9.7l6.1-1.9z" />
          </svg>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {/* Date range */}
        <Pill icon={Calendar} label={dateRange.label} open={openMenu === "date"} onToggle={() => toggle("date")}>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setDateRange({ ...p }); setOpenMenu(null); }}
              className={cn(
                "flex items-center justify-between w-full text-left px-3 py-1.5 text-[12.5px] rounded-lg hover:bg-muted transition-colors",
                dateRange.label === p.label ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {p.label}
              {dateRange.label === p.label && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </Pill>

        <Pill icon={Clock} label="Last 30 days" />

        {/* Platform filter */}
        <Pill icon={AtSign} label={platformLabelText} open={openMenu === "platform"} onToggle={() => toggle("platform")}>
          <button
            onClick={() => { setAllPlatforms(); }}
            className={cn(
              "flex items-center justify-between w-full text-left px-3 py-1.5 text-[12.5px] rounded-lg hover:bg-muted transition-colors",
              activePlatforms.length === 3 ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            All Platforms
            {activePlatforms.length === 3 && <Check className="w-3.5 h-3.5" />}
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={cn(
                "flex items-center justify-between w-full text-left px-3 py-1.5 text-[12.5px] rounded-lg hover:bg-muted transition-colors",
                activePlatforms.includes(p) ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {platformLabel(p)}
              {activePlatforms.includes(p) && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </Pill>

        <Pill icon={CheckCircle2} label="All Content Types" />

        {/* Compare to previous period toggle */}
        <button
          onClick={toggleMoM}
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12.5px] font-medium transition-colors",
            showMoM
              ? "bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
              : "bg-card border-border text-muted-foreground hover:bg-muted"
          )}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          vs Last Year
          {showMoM && <Check className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
