"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  section: string;
  data: unknown;
  className?: string;
}

export function AIInsightButton({ section, data, className }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");

  const fetchInsight = async () => {
    if (insight) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    setInsight("");

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
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE chunks
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = line.slice(6);
            if (text === "[DONE]") break;
            try {
              const parsed = JSON.parse(text);
              if (parsed.text) setInsight((prev) => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch {
      setInsight("Unable to generate insight. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setInsight("");
    setLoading(true);
    fetchInsight();
  };

  return (
    <div className={cn("", className)}>
      <button
        onClick={fetchInsight}
        className={cn(
          "flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all",
          "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
        )}
        title="Get AI insight for this section"
      >
        <Sparkles className="w-3 h-3" />
        AI Insight
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1 text-indigo-400 text-[10px] font-semibold">
              <Sparkles className="w-3 h-3" />
              AI Analysis
            </div>
            <div className="flex items-center gap-1">
              {!loading && (
                <button
                  onClick={refresh}
                  className="text-[10px] text-indigo-400/60 hover:text-indigo-400 transition-colors"
                >
                  Refresh
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          {loading && !insight && (
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analysing data...
            </div>
          )}
          {insight && (
            <p className="text-foreground/80 leading-relaxed">{insight}</p>
          )}
        </div>
      )}
    </div>
  );
}
