import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;    // desktop: nav panel collapsed
  mobileOpen: boolean;   // mobile: drawer open
  toggle: () => void;          // desktop collapse toggle
  toggleMobile: () => void;    // mobile drawer toggle
  closeMobile: () => void;     // close mobile drawer (backdrop / nav click)
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  closeMobile: () => set({ mobileOpen: false }),
}));
