"use client";

import { cn } from "@/lib/utils";
import { Search, ChevronRight, ChevronDown, Settings, HelpCircle, Bell, Moon, Sun, Download, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { MOCK_DATA } from "@/data/mockData";
import { useSidebarStore } from "@/store/sidebarStore";

function exportCSV() {
  const rows = [
    ["Title", "Platform", "Type", "Date", "Likes", "Comments", "Shares", "Saves", "Reach", "Eng%"],
    ...MOCK_DATA.contentPosts.map((p) => [
      p.title, p.platform, p.type, p.date,
      p.likes, p.comments,
      p.shares === -1 ? "N/A" : p.shares,
      p.saves === -1  ? "N/A" : p.saves,
      p.reach, `${p.engagementRate}%`,
    ]),
  ];
  const csv = rows.map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rarefitness-smm-march2026.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const toggleMobile = useSidebarStore((s) => s.toggleMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-14 border-b border-border bg-background sticky top-0 z-30 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors shrink-0"
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb — collapses on small screens */}
      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        <span className="text-muted-foreground hidden sm:inline">Brand</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:inline" />
        <span className="text-muted-foreground hidden md:inline">Marketing</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden md:inline" />
        <span className="text-foreground font-medium truncate">Social Media</span>
      </div>

      <div className="flex-1" />

      {/* Search — desktop only */}
      <div className="relative hidden lg:flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
        <input
          className="h-8 pl-8 pr-3 text-[13px] rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-44"
          placeholder="Search..."
        />
      </div>

      {/* Brand dropdown — hidden on mobile */}
      <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-foreground text-background text-[12.5px] font-medium shrink-0">
        <Settings className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Brand - BD Master</span>
        <span className="lg:hidden">Brand</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {/* Export CSV */}
      <button
        onClick={exportCSV}
        title="Export content data as CSV"
        className={cn(
          "h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0",
          "text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
        )}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0">
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors shrink-0"
      >
        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors relative shrink-0">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">G</div>
    </header>
  );
}
