import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useMemoryStore } from '@renderer/stores/useMemoryStore';
import { debounce } from '@renderer/lib/utils';

export const StreamSearch: React.FC = () => {
  const query = useMemoryStore((s) => s.searchQuery);
  const setQuery = useMemoryStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedRef = useRef(debounce((q: string) => setQuery(q), 150));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex items-center gap-2 h-11 px-4 border-b border-border bg-bg-secondary">
      <Search size={15} className="text-text-muted" />
      <input
        ref={inputRef}
        defaultValue={query}
        onChange={(e) => debouncedRef.current(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (inputRef.current) inputRef.current.value = '';
            setQuery('');
          }
        }}
        placeholder="Search your memories…"
        className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted text-[13.5px]"
      />
      {query ? (
        <button
          onClick={() => {
            if (inputRef.current) inputRef.current.value = '';
            setQuery('');
          }}
          className="text-text-muted hover:text-text-primary"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}
      <span className="text-[10.5px] text-text-muted hidden sm:inline">⌘K</span>
    </div>
  );
};
