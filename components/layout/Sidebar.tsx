"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { useAnomalyStore } from "@/store/anomalyStore";
import {
  LayoutGrid, Globe, Megaphone, Share2, DollarSign, Link2, Filter,
  Bot, FileText, Plug, RefreshCw, PanelLeftClose, PanelLeftOpen, X,
  Building2, BarChart3, ShoppingBag, Headphones, GraduationCap,
  Smartphone, Dumbbell, Users, Sparkles, Settings,
} from "lucide-react";

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
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebarStore();
  const anomalyCount = useAnomalyStore((s) => s.count);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static flex child on desktop */}
      <div
        className={cn(
          "flex h-screen shrink-0 bg-[#0a0a0b] z-50 transition-transform duration-200 ease-in-out",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Icon rail */}
        <div className="w-[62px] flex flex-col items-center py-3 border-r border-white/[0.05]">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mb-4 shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>

          <nav className="flex-1 flex flex-col gap-1 w-full px-1.5 overflow-y-auto scrollbar-none">
            {RAIL.map((item) => (
              <button
                key={item.label}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors",
                  item.active
                    ? "bg-white/10 text-white"
                    : "text-white/35 hover:text-white/70 hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[8px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggle}
            className="hidden lg:block text-white/30 hover:text-white/60 mt-2 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="lg:hidden text-white/30 hover:text-white/60 mt-2 transition-colors"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav panel — collapsible on desktop, always shown when drawer open on mobile */}
        <aside
          className={cn(
            "flex flex-col py-4 border-r border-white/[0.05] overflow-y-auto scrollbar-none transition-all duration-200 ease-in-out",
            collapsed
              ? "w-0 opacity-0 overflow-hidden py-0 border-0"
              : "w-[188px] opacity-100"
          )}
        >
          <nav className="flex-1 space-y-5">
            {NAV.map((section) => (
              <div key={section.label}>
                <p className="px-4 mb-1.5 text-[9px] font-semibold tracking-[0.12em] text-white/25">
                  {section.label}
                </p>
                <ul className="space-y-0.5 px-2">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href="#"
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors",
                          item.active
                            ? "bg-white/10 text-white"
                            : "text-white/45 hover:text-white/80 hover:bg-white/5"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.active && anomalyCount > 0 && (
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold shrink-0">
                            {anomalyCount > 9 ? "9+" : anomalyCount}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
