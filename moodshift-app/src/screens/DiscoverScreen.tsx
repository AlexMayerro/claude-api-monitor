import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { STYLES } from '../data/styles';
import { StyleCard } from '../components/StyleCard';
import { useAppStore } from '../stores/useAppStore';

export function DiscoverScreen() {
  const setPendingStyleId = useAppStore((s) => s.setPendingStyleId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setCurrentIdx(idx);
          }
        });
      },
      { root: el, threshold: [0.6] },
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full bg-bg-primary">
      <div
        ref={scrollRef}
        className="snap-feed no-scrollbar h-full w-full"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {STYLES.map((s, i) => (
          <div
            key={s.id}
            data-idx={i}
            className="relative h-full w-full"
            style={{ height: '100%' }}
          >
            <StyleCard
              style={s}
              index={i}
              total={STYLES.length}
              onTry={() => setPendingStyleId(s.id)}
            />
          </div>
        ))}
      </div>

      {/* Swipe hint */}
      <AnimatePresence>
        {showHint && currentIdx === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-32 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white/70"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
            >
              <ArrowDown size={16} />
            </motion.div>
            <span className="text-[11px] font-semibold uppercase tracking-widest">
              Swipe up
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
