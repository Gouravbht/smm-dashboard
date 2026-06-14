import { create } from "zustand";
import type { DateRange, FilterState, Platform } from "@/types";

interface FilterActions {
  setDateRange: (range: DateRange) => void;
  togglePlatform: (platform: Platform) => void;
  setAllPlatforms: () => void;
  reset: () => void;
}

const DEFAULT_DATE_RANGE: DateRange = {
  start: "2026-03-01",
  end: "2026-03-31",
  label: "Mar 1 – Mar 31",
};

const ALL_PLATFORMS: Platform[] = ["instagram", "youtube", "facebook"];

const initialState: FilterState = {
  dateRange: DEFAULT_DATE_RANGE,
  activePlatforms: ALL_PLATFORMS,
};

export const useFilterStore = create<FilterState & FilterActions>()((set, get) => ({
  ...initialState,

  setDateRange: (range) => set({ dateRange: range }),

  togglePlatform: (platform) => {
    const { activePlatforms } = get();
    const isActive = activePlatforms.includes(platform);
    if (isActive && activePlatforms.length === 1) return; // always keep at least one
    set({
      activePlatforms: isActive
        ? activePlatforms.filter((p) => p !== platform)
        : [...activePlatforms, platform],
    });
  },

  setAllPlatforms: () => set({ activePlatforms: ALL_PLATFORMS }),

  reset: () => set(initialState),
}));
