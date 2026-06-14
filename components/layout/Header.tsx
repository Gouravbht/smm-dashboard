"use client";

import { cn } from "@/lib/utils";
import { Search, ChevronRight, ChevronDown, Settings, HelpCircle, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center gap-3 px-6 h-14 border-b border-border bg-background sticky top-0 z-30 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground">Brand</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-muted-foreground">Marketing</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-foreground font-medium">Social Media</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
        <input
          className="h-8 pl-8 pr-3 text-[13px] rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-44"
          placeholder="Search..."
        />
      </div>

      {/* Brand dropdown */}
      <button className="flex items-center gap-2 h-8 px-3 rounded-lg bg-foreground text-background text-[12.5px] font-medium">
        <Settings className="w-3.5 h-3.5" />
        Brand - BD Master
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
      >
        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>

      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">G</div>
    </header>
  );
}
