"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAnomalyStore } from "@/store/anomalyStore";
import { AlertTriangle, X, Zap, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Anomaly } from "@/types";

export function AnomalyAlerts() {
  const { data } = useDashboardStore();
  const setAnomalyCount = useAnomalyStore((s) => s.setCount);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched) return;
    setFetched(true);
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json = await res.json();
      if (json.anomalies) {
        setAnomalies(json.anomalies);
        setAnomalyCount(json.anomalies.length);
      }
    } catch {
      // Silently fail — anomaly detection is non-critical
    } finally {
      setLoading(false);
    }
  };

  const dismiss = (id: string) => setDismissed((prev) => new Set(Array.from(prev).concat(id)));
  const visible = anomalies.filter((a) => !dismissed.has(a.id));

  if (loading) {
    return (
      <div className="mx-4 sm:mx-6 mt-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
          <Zap className="w-3 h-3 animate-pulse text-amber-400" />
          AI scanning for anomalies...
        </div>
      </div>
    );
  }

  if (!visible.length) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-2 space-y-2">
      {visible.map((anomaly) => (
        <div
          key={anomaly.id}
          className={cn(
            "flex items-start gap-3 rounded-lg px-3 py-2.5 text-xs border",
            anomaly.severity === "high" && "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300",
            anomaly.severity === "medium" && "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300",
            anomaly.severity === "low" && "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300",
          )}
        >
          {anomaly.severity === "high" && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
          {anomaly.severity === "medium" && <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
          {anomaly.severity === "low" && <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <span className="font-semibold">{anomaly.metric}: </span>
            <span className="text-foreground/70">{anomaly.reason}</span>
            <span className="ml-1 text-muted-foreground/50">
              (actual: {anomaly.value}, expected: {anomaly.expected})
            </span>
          </div>
          <button
            onClick={() => dismiss(anomaly.id)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
