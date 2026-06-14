import { create } from "zustand";

interface AnomalyState {
  count: number;
  setCount: (n: number) => void;
}

export const useAnomalyStore = create<AnomalyState>()((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));
