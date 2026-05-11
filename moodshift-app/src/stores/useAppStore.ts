import { create } from 'zustand';
import type { RegradedPhoto, TabKey } from '../types';

interface AppState {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  /** Saved regraded photos in this session. */
  regrades: RegradedPhoto[];
  addRegrade: (photo: RegradedPhoto) => void;
  removeRegrade: (id: string) => void;

  /** Style IDs the user has hearted. */
  favorites: Set<string>;
  toggleFavorite: (styleId: string) => void;

  /** Free-plan daily usage. */
  dailyLimit: number;
  usedToday: number;
  consumeDaily: () => boolean;

  /** Currently selected style in the regrade flow. */
  pendingStyleId: string | null;
  setPendingStyleId: (id: string | null) => void;

  /** Currently selected source image (object/data URL) for the regrade flow. */
  pendingSrc: string | null;
  setPendingSrc: (src: string | null) => void;

  /** Upgrade modal state. */
  upgradeOpen: boolean;
  setUpgradeOpen: (open: boolean) => void;

  /** Splash completion. */
  splashDone: boolean;
  setSplashDone: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'discover',
  setActiveTab: (tab) => set({ activeTab: tab }),

  regrades: [],
  addRegrade: (photo) => set((state) => ({ regrades: [photo, ...state.regrades] })),
  removeRegrade: (id) =>
    set((state) => ({ regrades: state.regrades.filter((p) => p.id !== id) })),

  favorites: new Set<string>(),
  toggleFavorite: (styleId) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(styleId)) next.delete(styleId);
      else next.add(styleId);
      return { favorites: next };
    }),

  dailyLimit: 5,
  usedToday: 2,
  consumeDaily: () => {
    const { usedToday, dailyLimit } = get();
    if (usedToday >= dailyLimit) {
      set({ upgradeOpen: true });
      return false;
    }
    set({ usedToday: usedToday + 1 });
    return true;
  },

  pendingStyleId: null,
  setPendingStyleId: (id) => set({ pendingStyleId: id }),

  pendingSrc: null,
  setPendingSrc: (src) => set({ pendingSrc: src }),

  upgradeOpen: false,
  setUpgradeOpen: (open) => set({ upgradeOpen: open }),

  splashDone: false,
  setSplashDone: (v) => set({ splashDone: v }),
}));
