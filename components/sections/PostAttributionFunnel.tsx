"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { useFilterStore } from "@/store/filterStore";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel, AICallout } from "@/components/layout/Section";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function useInView(ref: React.RefObject<Element>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

export function PostAttributionFunnel() {
  const { getFilteredData } = useDashboardStore();
  const { activePlatforms } = useFilterStore();
  const { attributionFunnel } = getFilteredData(activePlatforms);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef as React.RefObject<Element>);

  const conversions = ["0.93% CTR", "62% stay", "24% of sessions", "61% complete"];

  return (
    <Section label="SMM Attribution Loop" className="pb-8">
      <Panel>
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">
              Post-to-Lead Conversion Flow — March 2026
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Social post → UTM link → Landing page → Form → Lead captured · tracked via GA4 + UTM parameters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0">
              Instagram Reels — primary funnel
            </span>
            <AIInsightButton section="Post Attribution Funnel" data={attributionFunnel} />
          </div>
        </div>

        {/* Animated funnel cards — horizontal scroll on mobile */}
        <div ref={sectionRef} className="px-5 flex items-stretch gap-0 overflow-x-auto scrollbar-none min-w-0 [&>*]:min-w-[140px] sm:[&>*]:min-w-0">
          {attributionFunnel.map((stage, i) => {
            const isFirst = i === 0;
            const isLast = i === attributionFunnel.length - 1;
            return (
              <div key={stage.stage} className="flex items-center flex-1 min-w-0">
                <div
                  className={cn(
                    "rounded-xl border p-3 flex-1 min-w-0 h-full flex flex-col transition-all duration-500",
                    isFirst ? "bg-foreground border-foreground" : "bg-card border-border",
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: inView ? `${i * 80}ms` : "0ms" }}
                >
                  <p className={cn("text-[10px] font-bold", isFirst ? "text-background/50" : "text-muted-foreground/40")}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className={cn("text-[11px] font-semibold mt-1 leading-tight", isFirst ? "text-background" : "text-foreground")}>
                    {stage.stage}
                  </p>
                  <p className={cn(
                    "text-[22px] font-black mt-1.5 leading-none tracking-tight",
                    isLast ? "text-emerald-500" : isFirst ? "text-background" : "text-foreground"
                  )}>
                    {fmt(stage.count)}
                  </p>
                  <p className={cn("text-[10px] mt-1.5", isFirst ? "text-background/60" : "text-muted-foreground")}>
                    {stage.rate}
                  </p>
                </div>
                {!isLast && (
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 text-muted-foreground/30 mx-1 shrink-0 transition-all duration-500",
                      inView ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: inView ? `${i * 80 + 40}ms` : "0ms" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Conversion row */}
        <div className="px-5 mt-3 hidden sm:flex items-center">
          {attributionFunnel.map((_, i) => {
            if (i === attributionFunnel.length - 1) return null;
            return (
              <div key={i} className="flex-1 flex items-center justify-center">
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all duration-500",
                    i === attributionFunnel.length - 2 ? "text-emerald-500" : "text-muted-foreground",
                    inView ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: inView ? `${i * 80 + 200}ms` : "0ms" }}
                >
                  → {conversions[i] ?? ""}
                </span>
              </div>
            );
          })}
          <div className="w-5 shrink-0" />
        </div>

        <AICallout>
          <strong className="text-foreground">Instagram Reels → lead conversion rate: 9.1% (of link clicks).</strong> The biggest drop is at Link Clicks (only 0.93% of impressions click) — bio link + Story swipe-up are the primary paths. Form completion (61%) is strong once users reach the form. UTM parameters tracked via GA4 source=instagram, medium=social, campaign=smm.
        </AICallout>
      </Panel>
    </Section>
  );
}
