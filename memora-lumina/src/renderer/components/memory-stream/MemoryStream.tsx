import React, { useEffect, useMemo } from 'react';
import { Brain } from 'lucide-react';
import { StreamSearch } from './StreamSearch';
import { StreamFilters } from './StreamFilters';
import { StreamEntry } from './StreamEntry';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { useSettingsStore } from '@renderer/stores/useSettingsStore';
import type { Memory } from '@shared/types';

export const MemoryStream: React.FC = () => {
  const memories = useMemoryStore((s) => s.memories);
  const searchResults = useMemoryStore((s) => s.searchResults);
  const searchQuery = useMemoryStore((s) => s.searchQuery);
  const loadMemories = useMemoryStore((s) => s.loadMemories);
  const loadStats = useMemoryStore((s) => s.loadStats);
  const loading = useMemoryStore((s) => s.loading);
  const setFilters = useMemoryStore((s) => s.setFilters);
  const defaultSort = useSettingsStore((s) => s.settings.stream_default_sort);
  const defaultRange = useSettingsStore((s) => s.settings.stream_default_range);

  useEffect(() => {
    setFilters({
      sortBy: defaultSort,
      startDate: defaultRange === 'all' ? undefined : new Date(Date.now() - (defaultRange === '7d' ? 7 : 30) * 86400000).toISOString(),
    });
    loadMemories();
    loadStats();
  }, [defaultSort, defaultRange, setFilters, loadMemories, loadStats]);

  const displayed: Memory[] = useMemo(() => {
    if (searchResults !== null) return searchResults.map((r) => r.memory);
    return memories;
  }, [searchResults, memories]);

  const matchCount = useMemo(() => {
    if (searchResults === null) return 0;
    return searchResults.reduce((sum, r) => sum + r.matchCount, 0);
  }, [searchResults]);

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      <StreamSearch />
      <StreamFilters />
      {searchQuery ? (
        <div className="px-4 py-1.5 text-[11.5px] text-text-muted border-b border-border-subtle bg-bg-secondary">
          Found {matchCount} {matchCount === 1 ? 'match' : 'matches'} across {displayed.length}{' '}
          {displayed.length === 1 ? 'memory' : 'memories'}
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto">
        {loading && displayed.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-[13px]">Loading memories…</div>
        ) : displayed.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-muted gap-2 p-8">
            <Brain size={32} className="opacity-50" />
            <div className="text-text-primary text-sm font-medium">
              {searchQuery ? 'No memories match your search.' : 'No memories yet.'}
            </div>
            <div className="text-[12.5px]">
              {searchQuery ? 'Try different keywords.' : 'Memories will appear here as you chat.'}
            </div>
          </div>
        ) : (
          displayed.map((m) => <StreamEntry key={m.id} memory={m} query={searchQuery} />)
        )}
      </div>
    </div>
  );
};
