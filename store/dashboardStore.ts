import { create } from "zustand";
import { MOCK_DATA } from "@/data/mockData";
import type { DashboardData, Platform } from "@/types";

interface DashboardState {
  data: DashboardData;
  getFilteredData: (platforms: Platform[]) => DashboardData;
}

export const useDashboardStore = create<DashboardState>()((_, get) => ({
  data: MOCK_DATA,

  getFilteredData: (platforms: Platform[]): DashboardData => {
    const { data } = get();
    if (platforms.length === 0 || platforms.length === 3) return data;

    return {
      ...data,
      platforms: data.platforms.filter((p) => platforms.includes(p.platform)),
      contentPosts: data.contentPosts.filter((p) =>
        platforms.includes(p.platform)
      ),
      videoCompletion: data.videoCompletion.filter((v) =>
        platforms.includes(v.platform)
      ),
      weeklyReach: data.weeklyReach.map((w) => {
        const filtered = { ...w };
        if (!platforms.includes("instagram")) filtered.instagram = 0;
        if (!platforms.includes("youtube")) filtered.youtube = 0;
        if (!platforms.includes("facebook")) filtered.facebook = 0;
        filtered.total = filtered.instagram + filtered.youtube + filtered.facebook;
        return filtered;
      }),
      audienceGrowth: data.audienceGrowth.map((g) => {
        const filtered = { ...g };
        if (!platforms.includes("instagram")) filtered.instagram = 0;
        if (!platforms.includes("youtube")) filtered.youtube = 0;
        if (!platforms.includes("facebook")) filtered.facebook = 0;
        return filtered;
      }),
    };
  },
}));
