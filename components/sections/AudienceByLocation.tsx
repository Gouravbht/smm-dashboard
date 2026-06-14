"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { useFilterStore } from "@/store/filterStore";
import { cn } from "@/lib/utils";

const PLATFORM_TABS = ["All", "Instagram", "YouTube", "Facebook"] as const;
type LocationTab = typeof PLATFORM_TABS[number];

export function AudienceByLocation() {
  const { data } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { locations, punjabConcentration } = data;

  return (
    <section className="px-6 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Audience by Location
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Top Locations — Combined Audience</p>
          <p className="text-[10px] text-muted-foreground/60">Instagram + Facebook: Meta Graph API · audience_location · city level · YouTube: country level only</p>
        </div>
        <AIInsightButton section="Audience by Location" data={{ locations, concentration: punjabConcentration }} />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Location list */}
        <div className="col-span-3">
          {/* Platform tabs */}
          <div className="flex gap-1 mb-3">
            {PLATFORM_TABS.map((t) => (
              <button
                key={t}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border",
                  t === "All"
                    ? "bg-foreground text-background border-transparent"
                    : "text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {t}
              </button>
            ))}
            <select className="ml-auto text-[11px] border border-border rounded-md px-2 py-1 bg-background text-foreground">
              <option>India</option>
            </select>
            <select className="text-[11px] border border-border rounded-md px-2 py-1 bg-background text-foreground">
              <option>All Locations</option>
            </select>
          </div>

          <div className="space-y-2">
            {locations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-3 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate">{loc.city}</span>
                    <span className="text-[11px] font-semibold text-foreground ml-2 shrink-0">
                      {loc.count.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500/60 transition-all duration-500"
                      style={{ width: `${(loc.count / locations[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Punjab concentration */}
        <div className="col-span-2 flex flex-col">
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center text-center flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Punjab Concentration</p>
            <div className="relative w-32 h-32 mb-4">
              {/* Circular progress */}
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="10"
                  strokeDasharray={`${punjabConcentration.percentage * 3.14159} ${100 * 3.14159}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-foreground">{punjabConcentration.percentage}%</span>
              </div>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">of total audience</p>
            <p className="text-[10px] text-muted-foreground mb-3">is in Punjab</p>
            <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-3 text-[11px] text-muted-foreground leading-relaxed text-left">
              <span className="text-indigo-400 font-bold mr-1">✦</span>
              {punjabConcentration.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
