"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Globe,
  Megaphone,
  Target,
  TrendingUp,
  Bot,
  Settings,
  Layers,
  ChevronRight,
  LayoutDashboard,
  LineChart,
  Share2,
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "MARKETING",
    items: [
      { icon: LayoutDashboard, label: "Summary", href: "#" },
      { icon: Globe, label: "Web Analytics", href: "#" },
      { icon: Megaphone, label: "Ads & Campaigns", href: "#" },
      { icon: Share2, label: "Social Media", href: "#", active: true },
    ],
  },
  {
    label: "PLANNING",
    items: [
      { icon: Target, label: "Marketing Budgets", href: "#" },
      { icon: Layers, label: "UTM Builder", href: "#" },
      { icon: TrendingUp, label: "Funnel Builder", href: "#" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { icon: LineChart, label: "Analytics", href: "#" },
      { icon: Bot, label: "Marketing AI", href: "#" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { icon: Settings, label: "Form Builder", href: "#" },
      { icon: BarChart3, label: "Integrations", href: "#" },
      { icon: Settings, label: "Sync Configuration", href: "#" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0f1117] border-r border-white/[0.06] transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-52"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-white text-sm font-semibold tracking-tight truncate">
            RareFitness
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/30 hover:text-white/60 transition-colors"
        >
          <ChevronRight
            className={cn("w-3.5 h-3.5 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[9px] font-semibold tracking-widest text-white/25 uppercase">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded mx-1 text-[12px] font-medium transition-colors",
                      item.active
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
            G
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-white text-[11px] font-medium truncate">Gourav</p>
              <p className="text-white/30 text-[10px] truncate">BD Master</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
