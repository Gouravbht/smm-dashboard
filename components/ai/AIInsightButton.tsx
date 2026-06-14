"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, Eye, TrendingUp, Lightbulb, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  section: string;
  data: unknown;
  className?: string;
}

interface ParsedPoint {
  number: number;
  text: string;
}

const POINT_META = [
  { icon: Eye,        color: "text-blue-400",   label: "Observation" },
  { icon: TrendingUp, color: "text-green-400",  label: "Business Impact" },
  { icon: Lightbulb,  color: "text-amber-400",  label: "Recommendation" },
];

function parsePoints(raw: string): ParsedPoint[] {
  const points: ParsedPoint[] = [];
  for (const line of raw.split("\n")) {
    const match = line.trim().match(/^(\d)\.\s+(.+)/);
    if (match) points.push({ number: parseInt(match[1]), text: match[2].trim() });
  }
  return points;
}

export function AIInsightButton({ section, data, className }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState("");

  const points = parsePoints(rawText);
  const hasPoints = points.length > 0;

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

  return (
    <div className={cn("", className)}>
      {/* Trigger button */}
      <button
        onClick={() => fetchInsight()}
        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
      >
        <Sparkles className="w-3 h-3" />
        AI Insight
      </button>

      {/* Insight panel */}
      {open && (
        <div className="mt-2 rounded-xl bg-indigo-500/5 border border-indigo-500/15 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-indigo-500/10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-semibold text-indigo-400">AI Analysis — {section}</span>
              {loading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              {!loading && (
                <button
                  onClick={() => fetchInsight(true)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Refresh
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            {loading && !hasPoints && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50 py-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analysing {section} data…
              </div>
            )}

            {rawText.startsWith("ERROR:") && (
              <p className="text-xs text-red-400">⚠ {rawText.slice(7)}</p>
            )}

            {/* Numbered points — rendered as they stream in */}
            {hasPoints && (
              <div className="space-y-2">
                {points.map((point) => {
                  const meta = POINT_META[point.number - 1] ?? POINT_META[0];
                  const Icon = meta.icon;
                  return (
                    <div key={point.number} className="flex gap-2.5">
                      <div className="flex items-start gap-1.5 shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground/40 w-3 text-right leading-4">
                          {point.number}
                        </span>
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", meta.color)} />
                      </div>
                      <div>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider block mb-0.5", meta.color)}>
                          {meta.label}
                        </span>
                        <p className="text-[11px] text-foreground/80 leading-relaxed">{point.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fallback: streaming raw text before first numbered point is parsed */}
            {!hasPoints && !loading && rawText && !rawText.startsWith("ERROR:") && (
              <p className="text-[11px] text-foreground/80 leading-relaxed">{rawText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
