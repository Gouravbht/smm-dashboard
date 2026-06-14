"use client";

import { useFilterStore } from "@/store/filterStore";
import { platformColor, platformLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types";
import { Moon, Sun, Search, Bell, ChevronRight, Calendar, SlidersHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

const PLATFORMS: Platform[] = ["instagram", "youtube", "facebook"];

const DATE_PRESETS = [
  { label: "Last 7 days",  start: "2026-03-24", end: "2026-03-31" },
  { label: "Last 30 days", start: "2026-03-01", end: "2026-03-31" },
  { label: "Last 90 days", start: "2026-01-01", end: "2026-03-31" },
  { label: "Last 6 months",start: "2025-10-01", end: "2026-03-31" },
  { label: "Last 12 months",start: "2025-04-01", end: "2026-03-31" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { activePlatforms, togglePlatform, setAllPlatforms, dateRange, setDateRange } =
    useFilterStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const allActive = activePlatforms.length === 3;

  return (
    <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
        <span>Brand</span>
        <ChevronRight className="w-3 h-3" />
        <span>Marketing</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Social Media</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
        <input
          className="h-7 pl-8 pr-3 text-xs rounded-md border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-40"
          placeholder="Search..."
        />
      </div>

      {/* Date Picker */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors"
        >
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{dateRange.label}</span>
        </button>
        {showDatePicker && (
          <div className="absolute top-full mt-1 right-0 z-50 bg-popover border border-border rounded-lg shadow-xl p-2 min-w-[180px]">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setDateRange({ ...p, label: p.label });
                  setShowDatePicker(false);
                }}
                className={cn(
                  "block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-muted transition-colors",
                  dateRange.label === p.label ? "bg-muted text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Platform Filter */}
      <div className="flex items-center gap-1 h-7 px-1 rounded-md border border-border bg-background">
        <button
          onClick={setAllPlatforms}
          className={cn(
            "h-5 px-2 text-[10px] font-medium rounded transition-colors",
            allActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={cn(
              "h-5 px-2 text-[10px] font-medium rounded transition-colors capitalize",
              activePlatforms.includes(p)
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={activePlatforms.includes(p) ? { color: platformColor(p) } : {}}
          >
            {platformLabel(p).slice(0, 2).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content Type Filter */}
      <div className="flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md border border-border bg-background text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>All Content Types</span>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground"
      >
        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>

      {/* Bell */}
      <button className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground relative">
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      {/* Avatar */}
      <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
        G
      </div>
    </header>
  );
}
