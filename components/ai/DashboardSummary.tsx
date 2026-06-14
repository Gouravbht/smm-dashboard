"use client";

import { useEffect, useRef, useState } from "react";
import { useFilterStore } from "@/store/filterStore";
import { useDashboardStore } from "@/store/dashboardStore";
import {
  Sparkles, RefreshCw, Loader2,
  TrendingUp, TrendingDown, Zap, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParsedSummary {
  working: string[];
  underperforming: string[];
  action: string[];
}

function parseSummary(raw: string): ParsedSummary {
  const working: string[] = [];
  const underperforming: string[] = [];
  const action: string[] = [];

  let current: string[] | null = null;

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^WORKING:/i.test(trimmed))        { current = working; continue; }
    if (/^UNDERPERFORMING:/i.test(trimmed)) { current = underperforming; continue; }
    if (/^ACTION:/i.test(trimmed))          { current = action; continue; }

    if (current && (trimmed.startsWith("•") || trimmed.startsWith("-"))) {
      const text = trimmed.replace(/^[•\-]\s*/, "").trim();
      if (text) current.push(text);
    }
  }

  return { working, underperforming, action };
}

const PANELS = [
  {
    key: "working" as const,
    label: "What's Working",
    icon: TrendingUp,
    color: "green",
    bg: "bg-green-500/5 border-green-500/15",
    iconColor: "text-green-400",
    labelColor: "text-green-400",
    dotColor: "bg-green-400",
  },
  {
    key: "underperforming" as const,
    label: "Needs Attention",
    icon: TrendingDown,
    color: "red",
    bg: "bg-red-500/5 border-red-500/15",
    iconColor: "text-red-400",
    labelColor: "text-red-400",
    dotColor: "bg-red-400",
  },
  {
    key: "action" as const,
    label: "Next Actions",
    icon: Zap,
    color: "amber",
    bg: "bg-amber-500/5 border-amber-500/15",
    iconColor: "text-amber-400",
    labelColor: "text-amber-400",
    dotColor: "bg-amber-400",
  },
];

export function DashboardSummary() {
  const { activePlatforms, dateRange } = useFilterStore();
  const { getFilteredData } = useDashboardStore();
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const parsed = parseSummary(rawText);
  const hasContent = parsed.working.length > 0 || parsed.underperforming.length > 0 || parsed.action.length > 0;

  const fetchSummary = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setRawText("");

    try {
      const filtered = getFilteredData(activePlatforms);
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpi: filtered.kpi,
          platforms: filtered.platforms,
          filters: { activePlatforms, dateRange },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) setRawText((p) => p + parsed.text);
            if (parsed.error) setRawText(`ERROR: ${parsed.error}`);
          } catch { /* partial JSON — skip */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setRawText("ERROR: Unable to connect. Check your GROQ_API_KEY in .env.local");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) { setInitialized(true); return; }
    const t = setTimeout(fetchSummary, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(activePlatforms), dateRange.label]);

  useEffect(() => { fetchSummary(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-6 mt-4 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-purple-500/3 to-transparent overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-500/10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-indigo-400">AI Dashboard Summary</span>
          <span className="text-[10px] text-indigo-400/50 font-normal">— powered by Llama 3.3 70B</span>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          {loading ? "Analysing…" : "Refresh"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && !hasContent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            Analysing {activePlatforms.join(", ")} performance for {dateRange.label}…
          </div>
        )}

        {rawText.startsWith("ERROR:") && (
          <p className="text-xs text-red-400 py-1">⚠ {rawText.slice(7)}</p>
        )}

        {(hasContent || (loading && hasContent)) && (
          <div className="grid grid-cols-3 gap-3">
            {PANELS.map(({ key, label, icon: Icon, bg, iconColor, labelColor, dotColor }) => {
              const items = parsed[key];
              return (
                <div key={key} className={cn("rounded-lg border p-3", bg)}>
                  {/* Panel header */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Icon className={cn("w-3.5 h-3.5", iconColor)} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", labelColor)}>
                      {label}
                    </span>
                  </div>

                  {/* Bullet list */}
                  {items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", dotColor)} />
                          <span className="text-[11px] text-foreground/80 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : loading ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating…
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
