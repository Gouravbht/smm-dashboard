"use client";

import { useEffect, useRef, useState } from "react";
import { useFilterStore } from "@/store/filterStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { Sparkles, RefreshCw, Loader2, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSummary() {
  const { activePlatforms, dateRange } = useFilterStore();
  const { data, getFilteredData } = useDashboardStore();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSummary = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setSummary("");

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
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.slice(6);
            if (text === "[DONE]") break;
            try {
              const parsed = JSON.parse(text);
              if (parsed.text) setSummary((prev) => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setSummary("⚠ Unable to generate summary. Please add your ANTHROPIC_API_KEY to .env.local");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) { setInitialized(true); return; }
    const timeout = setTimeout(fetchSummary, 500);
    return () => clearTimeout(timeout);
  }, [activePlatforms, dateRange]);

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="mx-6 mt-4 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-indigo-400">AI Dashboard Summary</span>
          {loading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {summary ? (
        <div className="grid grid-cols-3 gap-3">
          {parseSections(summary).map((s, i) => (
            <div key={i} className={cn(
              "rounded-lg p-3 text-xs",
              i === 0 && "bg-green-500/5 border border-green-500/15",
              i === 1 && "bg-red-500/5 border border-red-500/15",
              i === 2 && "bg-amber-500/5 border border-amber-500/15",
            )}>
              <div className="flex items-center gap-1 mb-1">
                {i === 0 && <TrendingUp className="w-3 h-3 text-green-400" />}
                {i === 1 && <TrendingDown className="w-3 h-3 text-red-400" />}
                {i === 2 && <Zap className="w-3 h-3 text-amber-400" />}
                <span className={cn(
                  "font-semibold text-[10px] uppercase tracking-wide",
                  i === 0 && "text-green-400",
                  i === 1 && "text-red-400",
                  i === 2 && "text-amber-400",
                )}>
                  {["What's Working", "Underperforming", "Next Action"][i]}
                </span>
              </div>
              <p className="text-foreground/80 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Analysing overall performance...
        </div>
      ) : null}
    </div>
  );
}

function parseSections(text: string): string[] {
  // Try to split on numbered sections or newlines
  const parts = text.split(/\n(?:\d+[.)]\s*|\*{1,2}[^*]+\*{1,2}:\s*)/);
  if (parts.length >= 3) return parts.slice(0, 3).map((p) => p.trim()).filter(Boolean);
  // Fallback: split roughly into thirds
  const sentences = text.split(/(?<=[.!?])\s+/);
  const third = Math.ceil(sentences.length / 3);
  return [
    sentences.slice(0, third).join(" "),
    sentences.slice(third, third * 2).join(" "),
    sentences.slice(third * 2).join(" "),
  ].filter(Boolean);
}
