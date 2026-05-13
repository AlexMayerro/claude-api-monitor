import React, { useEffect, useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import type { Memory } from '@shared/types';

interface Props {
  memoryIds: string[];
}

export const MemoryIndicator: React.FC<Props> = ({ memoryIds }) => {
  const [open, setOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (!open || memories.length > 0) return;
    Promise.all(memoryIds.map((id) => fetchMemoryById(id))).then((arr) => {
      setMemories(arr.filter((m): m is Memory => !!m));
    });
  }, [open, memoryIds, memories.length]);

  return (
    <div className="text-[11px] text-text-muted">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 hover:text-text-secondary transition-colors"
      >
        <Brain size={11} /> Used {memoryIds.length} {memoryIds.length === 1 ? 'memory' : 'memories'}
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {open && memories.length > 0 ? (
        <div className="mt-1.5 p-2 rounded-md bg-surface-elevated border border-border-subtle space-y-1 max-w-md">
          {memories.map((m) => (
            <div key={m.id} className="text-text-secondary text-[11.5px] leading-snug">
              • {m.summary}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

async function fetchMemoryById(id: string): Promise<Memory | null> {
  const results = await window.memora.getMemories({ limit: 5000 });
  return results.find((m) => m.id === id) || null;
}
