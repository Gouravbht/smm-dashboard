"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Loader2, Eye, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  section: string;
  data: unknown;
  className?: string;
  autoFetch?: boolean;
}

interface ParsedPoint {
  number: number;
  text: string;
}

const POINT_META = [
  { icon: Eye,        color: "text-blue-600 dark:text-blue-400",       label: "Observation" },
  { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", label: "Business Impact" },
  { icon: Lightbulb,  color: "text-amber-600 dark:text-amber-400",     label: "Recommendation" },
];

function parsePoints(raw: string): ParsedPoint[] {
  const points: ParsedPoint[] = [];
  for (const line of raw.split("\n")) {
    const match = line.trim().match(/^(\d)\.\s+(.+)/);
    if (match) points.push({ number: parseInt(match[1]), text: match[2].trim() });
  }
  return points;
}

export function AIInsightButton({ section, data, className, autoFetch }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const points = parsePoints(rawText);
  const hasPoints = points.length > 0;

  // Auto-fetch on mount with a delay so it feels ambient, not instant
  useEffect(() => {
    if (!autoFetch) return;
    const t = setTimeout(() => fetchInsight(), 1800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const fetchInsight = async (force = false) => {
    if (!force && rawText && !rawText.startsWith("ERROR:")) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    setRawText("");

    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
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
            if (parsed.text)  setRawText((p) => p + parsed.text);
            if (parsed.error) setRawText(`ERROR: ${parsed.error}`);
          } catch { /* partial */ }
        }
      }
    } catch {
      setRawText("ERROR: Unable to fetch insight. Check your GROQ_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  const popup = open && mounted ? createPortal(
    <>
      {/* Transparent click-catcher — closes on outside click without dimming the UI */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={() => setOpen(false)}
      />

      {/* Floating popup — bottom-right on desktop, bottom sheet on mobile */}
      <div
        role="dialog"
        aria-label={`AI analysis for ${section}`}
        className={cn(
          "fixed z-[61] flex flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl",
          "animate-in fade-in slide-in-from-bottom-4 duration-200",
          "left-3 right-3 bottom-3 max-h-[75vh]",
          "sm:left-auto sm:right-5 sm:bottom-5 sm:w-[400px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-indigo-50 dark:bg-indigo-500/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-foreground leading-tight">AI Analysis</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{section}</p>
            </div>
            {loading && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin ml-1" />}
          </div>
          <div className="flex items-center gap-1">
            {!loading && (
              <button
                onClick={() => fetchInsight(true)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {loading && !hasPoints && (
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analysing {section} data…
            </div>
          )}

          {rawText.startsWith("ERROR:") && (
            <p className="text-[12px] text-red-500 dark:text-red-400">⚠ {rawText.slice(7)}</p>
          )}

          {hasPoints && (
            <div className="space-y-3.5">
              {points.map((point) => {
                const meta = POINT_META[point.number - 1] ?? POINT_META[0];
                const Icon = meta.icon;
                return (
                  <div key={point.number} className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <Icon className={cn("w-4 h-4", meta.color)} />
                    </div>
                    <div>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider block mb-1", meta.color)}>
                        {meta.label}
                      </span>
                      <p className="text-[12px] text-foreground/90 leading-relaxed">{point.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!hasPoints && !loading && rawText && !rawText.startsWith("ERROR:") && (
            <p className="text-[12px] text-foreground/90 leading-relaxed">{rawText}</p>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-muted/40 shrink-0">
          <p className="text-[9px] text-muted-foreground/70">Generated by Llama 3.3 70B · from live dashboard state</p>
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className={cn("inline-block", className)}>
      <button
        onClick={() => fetchInsight()}
        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20"
      >
        <Sparkles className="w-3 h-3" />
        AI Insight
      </button>
      {popup}
    </div>
  );
}
