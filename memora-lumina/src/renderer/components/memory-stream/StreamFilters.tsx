import React from 'react';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { Select } from '@renderer/components/common/Select';
import { cn } from '@renderer/lib/utils';
import type { MemoryLayer } from '@shared/types';

const LAYER_OPTIONS: { value: MemoryLayer; label: string }[] = [
  { value: 'core_identity', label: 'Core' },
  { value: 'long_term', label: 'Long-Term' },
  { value: 'mid_term', label: 'Mid-Term' },
  { value: 'short_term', label: 'Session' },
];

function startOfDateRange(range: 'all' | '7d' | '30d'): string | undefined {
  if (range === 'all') return undefined;
  const days = range === '7d' ? 7 : 30;
  return new Date(Date.now() - days * 86400000).toISOString();
}

export const StreamFilters: React.FC = () => {
  const filters = useMemoryStore((s) => s.filters);
  const setFilters = useMemoryStore((s) => s.setFilters);
  const stats = useMemoryStore((s) => s.stats);

  const [range, setRange] = React.useState<'all' | '7d' | '30d'>('all');

  const toggleLayer = (layer: MemoryLayer) => {
    const cur = filters.layers || [];
    const next = cur.includes(layer) ? cur.filter((l) => l !== layer) : [...cur, layer];
    setFilters({ layers: next.length === 0 ? undefined : next });
  };

  const applyRange = (r: 'all' | '7d' | '30d') => {
    setRange(r);
    setFilters({ startDate: startOfDateRange(r) });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-bg-secondary flex-wrap">
      <div className="flex items-center gap-1 mr-2">
        {(['all', '7d', '30d'] as const).map((r) => (
          <button
            key={r}
            onClick={() => applyRange(r)}
            className={cn(
              'px-2.5 h-7 text-[12px] rounded-md transition-colors',
              range === r ? 'bg-accent text-white' : 'text-text-secondary hover:bg-surface-elevated',
            )}
          >
            {r === 'all' ? 'All Time' : r === '7d' ? '7 days' : '30 days'}
          </button>
        ))}
      </div>
      <div className="h-5 w-px bg-border" />
      <div className="flex items-center gap-1">
        {LAYER_OPTIONS.map((opt) => {
          const active = filters.layers?.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleLayer(opt.value)}
              className={cn(
                'px-2.5 h-7 text-[12px] rounded-md transition-colors',
                active ? 'bg-accent-subtle text-accent border border-accent/40' : 'text-text-secondary hover:bg-surface-elevated border border-transparent',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="h-5 w-px bg-border" />
      <div className="flex items-center gap-2 text-[12px] text-text-secondary">
        <span>Sort:</span>
        <Select
          className="w-36"
          value={filters.sortBy || 'newest'}
          onChange={(v) => setFilters({ sortBy: v as any })}
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'importance', label: 'By importance' },
          ]}
        />
      </div>
      <div className="ml-auto text-[11.5px] text-text-muted">
        {stats ? <>{stats.total.toLocaleString()} memories · {stats.recentlyAddedCount} new this week</> : null}
      </div>
    </div>
  );
};
