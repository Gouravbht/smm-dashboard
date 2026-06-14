"use client";

import { POSTING_HEATMAP } from "@/data/mockData";
import { AIInsightButton } from "@/components/ai/AIInsightButton";
import { Section, Panel } from "@/components/layout/Section";
import { Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function heatColor(score: number): string {
  if (score < 20) return "bg-muted/80 dark:bg-muted/40";
  if (score < 40) return "bg-indigo-100 dark:bg-indigo-500/15";
  if (score < 55) return "bg-indigo-200 dark:bg-indigo-500/28";
  if (score < 68) return "bg-indigo-300 dark:bg-indigo-500/45";
  if (score < 80) return "bg-indigo-400 dark:bg-indigo-500/62";
  if (score < 88) return "bg-indigo-500 dark:bg-indigo-400/80";
  return "bg-indigo-600 dark:bg-indigo-400";
}

function textColor(score: number): string {
  if (score < 55) return "text-muted-foreground/60";
  if (score < 70) return "text-indigo-700 dark:text-indigo-200";
  return "text-white";
}

export function BestTimeToPost() {
  const { days, hours, scores, bestSlots, insight } = POSTING_HEATMAP;

  return (
    <Section
      label="Best Time to Post"
      action={
        <AIInsightButton
          section="Best Time to Post"
          data={{ heatmap: scores, days, hours, bestSlots, insight }}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: heatmap */}
        <Panel className="lg:col-span-2 px-5 pt-5 pb-4">
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">Engagement Heatmap</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Engagement index by day and hour — darker = higher audience activity
            </p>
          </div>

          {/* Grid — scrollable on small screens */}
          <div className="overflow-x-auto">
            <div className="min-w-[460px]">
              {/* Hour labels */}
              <div className="flex items-center gap-1 mb-1 pl-10">
                {hours.map((h) => (
                  <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
                    {h}
                  </div>
                ))}
              </div>

              {/* Day rows */}
              <div className="space-y-1">
                {days.map((day, di) => (
                  <div key={day} className="flex items-center gap-1">
                    <div className="w-9 shrink-0 text-[11px] text-muted-foreground font-medium text-right pr-1">
                      {day}
                    </div>
                    {scores[di].map((score, hi) => (
                      <div
                        key={hi}
                        title={`${day} ${hours[hi]}: ${score}`}
                        className={cn(
                          "flex-1 h-8 rounded-md flex items-center justify-center transition-all",
                          heatColor(score)
                        )}
                      >
                        <span className={cn("text-[10px] font-semibold tabular-nums", textColor(score))}>
                          {score}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-muted-foreground">Low</span>
                {["bg-muted/80", "bg-indigo-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-400", "bg-indigo-500", "bg-indigo-600"].map((c) => (
                  <div key={c} className={cn("w-5 h-3 rounded-sm", c)} />
                ))}
                <span className="text-[10px] text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* RIGHT: best slots */}
        <Panel className="px-5 pt-5 pb-4 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Best Windows</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Top 3 posting times this month</p>
          </div>

          <div className="space-y-3">
            {bestSlots.map((slot, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl p-3.5 border",
                  i === 0
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25"
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center",
                      i === 0 ? "bg-indigo-500 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">{slot.day}</span>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold",
                    i === 0 ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                  )}>
                    {slot.score}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px]">{slot.hour}</span>
                </div>
                {/* Score bar */}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      i === 0 ? "bg-indigo-500" : "bg-muted-foreground/30"
                    )}
                    style={{ width: `${slot.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 px-3 py-2.5 mt-auto">
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">{insight}</p>
          </div>
        </Panel>
      </div>
    </Section>
  );
}
