import { create } from 'zustand';
import { shortId } from '@renderer/lib/utils';

export type TabKind = 'chat' | 'memory-stream' | 'settings';

export interface Tab {
  id: string;
  kind: TabKind;
  title: string;
  conversationId?: string;
}

interface AppState {
  splashShown: boolean;
  setSplashShown: (v: boolean) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;

  tabs: Tab[];
  activeTabId: string | null;
  rightTabId: string | null;
  splitRatio: number;

  setActiveTab: (id: string) => void;
  openTab: (tab: Omit<Tab, 'id'>, replace?: boolean) => string;
  closeTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  splitWithTab: (id: string) => void;
  unsplit: () => void;
  setSplitRatio: (r: number) => void;
  reorderTabs: (from: number, to: number) => void;

  toastMessage: string | null;
  showToast: (msg: string, durationMs?: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  splashShown: false,
  setSplashShown: (v) => set({ splashShown: v }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  tabs: [],
  activeTabId: null,
  rightTabId: null,
  splitRatio: 0.55,

  setActiveTab: (id) => set({ activeTabId: id }),

  openTab: (tab, replace = false) => {
    const id = shortId();
    set((state) => {
      if (replace && state.activeTabId) {
        const idx = state.tabs.findIndex((t) => t.id === state.activeTabId);
        if (idx !== -1) {
          const newTabs = [...state.tabs];
          newTabs[idx] = { ...tab, id };
          return { tabs: newTabs, activeTabId: id };
        }
      }
      // Reuse existing tab of the same kind for memory-stream / settings
      if (tab.kind === 'memory-stream' || tab.kind === 'settings') {
        const existing = state.tabs.find((t) => t.kind === tab.kind);
        if (existing) return { activeTabId: existing.id };
      }
      if (tab.kind === 'chat' && tab.conversationId) {
        const existing = state.tabs.find((t) => t.kind === 'chat' && t.conversationId === tab.conversationId);
        if (existing) return { activeTabId: existing.id };
      }
      return { tabs: [...state.tabs, { ...tab, id }], activeTabId: id };
    });
    return id;
  },

  closeTab: (id) => {
    set((state) => {
      const tabs = state.tabs.filter((t) => t.id !== id);
      let activeTabId = state.activeTabId;
      let rightTabId = state.rightTabId;
      if (rightTabId === id) rightTabId = null;
      if (activeTabId === id) {
        activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
      }
      return { tabs, activeTabId, rightTabId };
    });
  },

  renameTab: (id, title) =>
    set((state) => ({ tabs: state.tabs.map((t) => (t.id === id ? { ...t, title } : t)) })),

  splitWithTab: (id) => set({ rightTabId: id }),
  unsplit: () => set({ rightTabId: null }),
  setSplitRatio: (r) => set({ splitRatio: Math.max(0.2, Math.min(0.8, r)) }),

  reorderTabs: (from, to) =>
    set((state) => {
      const tabs = [...state.tabs];
      const [moved] = tabs.splice(from, 1);
      tabs.splice(to, 0, moved);
      return { tabs };
    }),

  toastMessage: null,
  showToast: (msg, durationMs = 3000) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) set({ toastMessage: null });
    }, durationMs);
  },
}));
