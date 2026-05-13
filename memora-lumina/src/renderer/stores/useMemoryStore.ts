import { create } from 'zustand';
import type { Memory, MemorySearchResult, MemoryStats, MemoryFilters } from '@shared/types';

interface MemoryState {
  memories: Memory[];
  searchResults: MemorySearchResult[] | null;
  searchQuery: string;
  filters: MemoryFilters;
  stats: MemoryStats | null;
  autoJumpTargetId: string | null;
  loading: boolean;

  loadMemories: () => Promise<void>;
  setFilters: (filters: Partial<MemoryFilters>) => Promise<void>;
  setSearchQuery: (query: string) => Promise<void>;
  clearSearch: () => void;

  deleteMemory: (id: string) => Promise<void>;
  loadStats: () => Promise<void>;
  appendMemory: (memory: Memory) => void;

  triggerAutoJump: (id: string) => void;
  clearAutoJump: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  searchResults: null,
  searchQuery: '',
  filters: { sortBy: 'newest' },
  stats: null,
  autoJumpTargetId: null,
  loading: false,

  loadMemories: async () => {
    set({ loading: true });
    const memories = await window.memora.getMemories(get().filters);
    set({ memories, loading: false });
  },

  setFilters: async (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    if (get().searchQuery) {
      await get().setSearchQuery(get().searchQuery);
    } else {
      await get().loadMemories();
    }
  },

  setSearchQuery: async (query) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: null });
      return;
    }
    set({ loading: true });
    const results = await window.memora.searchMemories(query, get().filters);
    set({ searchResults: results, loading: false });
  },

  clearSearch: () => set({ searchQuery: '', searchResults: null }),

  deleteMemory: async (id) => {
    await window.memora.deleteMemory(id);
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
      searchResults: state.searchResults ? state.searchResults.filter((r) => r.memory.id !== id) : null,
    }));
    void get().loadStats();
  },

  loadStats: async () => {
    const stats = await window.memora.getMemoryStats();
    set({ stats });
  },

  appendMemory: (memory) => {
    set((state) => ({ memories: [memory, ...state.memories] }));
    void get().loadStats();
  },

  triggerAutoJump: (id) => set({ autoJumpTargetId: id }),
  clearAutoJump: () => set({ autoJumpTargetId: null }),
}));
