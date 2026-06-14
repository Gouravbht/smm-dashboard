"use client";

import { useFilterStore } from "@/store/filterStore";
import { Info } from "lucide-react";

export function PageTitle() {
  const { dateRange } = useFilterStore();

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Social Media</h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            Rare Fitness social media performance across different brand social channels. Last data fetched on 12 Mar, 2026 at 12:00pm.
            <Info className="w-3 h-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
