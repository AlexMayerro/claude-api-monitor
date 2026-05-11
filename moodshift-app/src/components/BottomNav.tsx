import { Sparkles, Grid2x2, Image as ImageIcon, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import type { TabKey } from '../types';

const TABS: { key: TabKey; label: string; Icon: typeof Sparkles }[] = [
  { key: 'discover', label: 'Discover', Icon: Sparkles },
  { key: 'library', label: 'Library', Icon: Grid2x2 },
  { key: 'photos', label: 'My Photos', Icon: ImageIcon },
  { key: 'profile', label: 'Profile', Icon: User },
];

export function BottomNav() {
  const active = useAppStore((s) => s.activeTab);
  const setActive = useAppStore((s) => s.setActiveTab);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pb-3 pt-2">
      <div className="mx-3 rounded-2xl border border-white/5 bg-bg-secondary/70 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-4">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -inset-2 rounded-full bg-accent/25 blur-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={2.2}
                    className={`relative transition-colors ${
                      isActive ? 'text-accent' : 'text-text-muted'
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-1 h-1 w-1 rounded-full bg-accent shadow-glow-sm"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
