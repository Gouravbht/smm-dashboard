"use client";

import { cn } from "@/lib/utils";
import {
  LayoutGrid, Globe, Megaphone, Share2, DollarSign, Link2, Filter,
  Bot, FileText, Plug, RefreshCw, PanelLeftClose,
  Building2, BarChart3, ShoppingBag, Headphones, GraduationCap,
  Smartphone, Dumbbell, Users, Sparkles, Settings,
} from "lucide-react";

// Far-left icon rail
const RAIL = [
  { icon: Building2, label: "Brand" },
  { icon: BarChart3, label: "Market", active: true },
  { icon: ShoppingBag, label: "Sales" },
  { icon: Headphones, label: "Service" },
  { icon: GraduationCap, label: "Coaching" },
  { icon: Smartphone, label: "App" },
  { icon: Dumbbell, label: "Gym" },
  { icon: Users, label: "Team" },
  { icon: Sparkles, label: "AI" },
  { icon: Settings, label: "Settings" },
];

// Main nav panel
const NAV = [
  {
    label: "MARKETING",
    items: [
      { icon: LayoutGrid, label: "Summary" },
      { icon: Globe, label: "Web Analytics" },
      { icon: Megaphone, label: "Ads & Campaigns" },
      { icon: Share2, label: "Social Media", active: true },
    ],
  },
  {
    label: "TRACKERS",
    items: [
      { icon: DollarSign, label: "Marketing Budgets" },
      { icon: Link2, label: "UTM Builder" },
      { icon: Filter, label: "Funnel Builder" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [{ icon: Bot, label: "Marketing AI" }],
  },
  {
    label: "SETTINGS",
    items: [
      { icon: FileText, label: "Form Builder" },
      { icon: Plug, label: "Integrations" },
      { icon: RefreshCw, label: "Sync Configuration" },
    ],
  },
];

export function Sidebar() {
  return (
    <div className="flex h-screen shrink-0 bg-[#0a0a0b]">
      {/* Icon rail */}
      <div className="w-[62px] flex flex-col items-center py-3 border-r border-white/[0.05]">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mb-4">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 w-full px-1.5">
          {RAIL.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors",
                item.active ? "bg-white/10 text-white" : "text-white/35 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[8px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="text-white/30 hover:text-white/60 mt-2">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Nav panel */}
      <aside className="w-[188px] flex flex-col py-4 border-r border-white/[0.05] overflow-y-auto scrollbar-none">
        <nav className="flex-1 space-y-5">
          {NAV.map((section) => (
            <div key={section.label}>
              <p className="px-4 mb-1.5 text-[9px] font-semibold tracking-[0.12em] text-white/25">{section.label}</p>
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href="#"
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors",
                        item.active ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
