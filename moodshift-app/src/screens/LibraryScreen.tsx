import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ALL_MOODS, STYLES } from '../data/styles';
import { StyleTile } from '../components/StyleTile';
import { useAppStore } from '../stores/useAppStore';

export function LibraryScreen() {
  const [q, setQ] = useState('');
  const [mood, setMood] = useState<(typeof ALL_MOODS)[number]>('All');
  const setPendingStyleId = useAppStore((s) => s.setPendingStyleId);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return STYLES.filter((s) => {
      if (mood !== 'All' && !s.moods.includes(mood as any)) return false;
      if (!t) return true;
      return (
        s.name.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t) ||
        s.tags.some((tag) => tag.toLowerCase().includes(t))
      );
    });
  }, [q, mood]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="aurora" />
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="px-5 pt-10 pb-3">
          <h1 className="text-screen text-white">Style Library</h1>
          <p className="text-[13px] text-text-secondary">
            {STYLES.length} cinematic moods to try
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-2xl border border-white/8 bg-bg-secondary/70 px-4 py-3 backdrop-blur-xl">
          <Search size={16} className="text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search styles..."
            className="w-full bg-transparent text-[14px] text-white placeholder:text-text-muted outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto px-5">
          {ALL_MOODS.map((m) => {
            const active = mood === m;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.92 }}
                onClick={() => setMood(m)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'border-transparent bg-accent text-white shadow-glow-sm'
                    : 'border-white/8 bg-bg-secondary/70 text-text-secondary'
                }`}
              >
                {m}
              </motion.button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
          {filtered.length === 0 ? (
            <div className="mt-16 text-center text-text-secondary">
              <p className="text-[15px] font-semibold text-white">No styles found</p>
              <p className="mt-1 text-[12px]">Try a different mood or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((s) => (
                <StyleTile key={s.id} style={s} onTap={() => setPendingStyleId(s.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
