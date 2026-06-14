"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { AtSign, MapPin, ChevronDown } from "lucide-react";
import { InstagramIcon as Instagram, YoutubeIcon as Youtube, FacebookIcon as Facebook } from "@/components/ui/brand-icons";
import { useState } from "react";

const TABS = [
  { key: "All", icon: AtSign },
  { key: "Instagram", icon: Instagram },
  { key: "Youtube", icon: Youtube },
  { key: "Facebook", icon: Facebook },
] as const;

export function AudienceByLocation() {
  const { data } = useDashboardStore();
  const { locations, punjabConcentration } = data;
  const [tab, setTab] = useState<string>("All");
  const maxCount = Math.max(...locations.map((l) => l.count));

  return (
    <Section label="Audience by Location">
      <div className="grid grid-cols-3 gap-4">
        {/* LEFT: location list */}
        <Panel className="col-span-2 flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Top Locations — Combined Audience</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Instagram + Facebook · Meta Graph API · audience_location · city level · YouTube country level only</p>
            </div>
            <AIInsightButton section="Audience by Location" data={{ locations, concentration: punjabConcentration }} />
          </div>

          {/* Tabs + dropdowns */}
          <div className="flex items-center justify-between px-5 mb-3">
            <div className="flex gap-1">
              {TABS.map(({ key, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                    tab === key ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                  <Icon className="w-3.5 h-3.5" />{key}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["India", "All Locations"].map((label) => (
                <button key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground border border-border hover:bg-muted/50 transition-colors">
                  <MapPin className="w-3 h-3" />{label}<ChevronDown className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 pb-5 space-y-2.5">
            {locations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground/50 w-4 text-right">{i + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/70 shrink-0" />
                <span className="text-[12px] font-medium text-foreground w-48 shrink-0 truncate">{loc.city}</span>
                <div className="flex-1 h-[3px] rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/80" style={{ width: `${(loc.count / maxCount) * 100}%` }} />
                </div>
                <span className="text-[12px] font-semibold text-foreground w-14 text-right shrink-0">{loc.count.toLocaleString("en-IN")}</span>
                <span className="text-[11px] text-muted-foreground/60 w-8 text-right shrink-0">{loc.percentage}%</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* RIGHT: Punjab concentration */}
        <Panel className="flex flex-col p-5">
          <h3 className="text-[15px] font-bold text-foreground tracking-tight mb-4">Punjab Concentration</h3>
          <p className="text-[44px] font-black text-foreground leading-none">{punjabConcentration.percentage}%</p>
          <p className="text-[11px] text-muted-foreground mt-2">of total audience in Punjab</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${punjabConcentration.percentage}%` }} />
          </div>
          <div className="mt-4 flex gap-2.5 rounded-lg bg-muted/60 border border-border/60 px-3 py-3">
            <div className="w-4 h-4 rounded bg-foreground flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-background"><path d="M12 2l1.9 5.8L20 9.7l-4.9 3.6L17 19l-5-3.6L7 19l1.9-5.7L4 9.7l6.1-1.9z" /></svg>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Strong local concentration.</strong> Diaspora (UAE + UK) is 7% and growing — consider targeted diaspora content in English/Punjabi.
            </p>
          </div>
        </Panel>
      </div>
    </Section>
  );
}
