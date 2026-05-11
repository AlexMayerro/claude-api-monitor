import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

/**
 * Tiny floating chip that reminds guests how many free regrades remain.
 * Sits above the bottom nav. Hidden for signed-in users.
 */
export function GuestBanner() {
  const auth = useAppStore((s) => s.auth);
  const plan = useAppStore((s) => s.plan);
  const guestUsed = useAppStore((s) => s.guestUsed);
  const guestLimit = useAppStore((s) => s.guestLimit);
  const setGuestGateOpen = useAppStore((s) => s.setGuestGateOpen);

  const visible = auth.kind === 'guest' && plan !== 'pro';
  if (!visible) return null;
  const remaining = Math.max(0, guestLimit - guestUsed);

  return (
    <AnimatePresence>
      <motion.button
        key={remaining}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
        onClick={() => setGuestGateOpen(true)}
        className="absolute bottom-[88px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-bg-secondary/80 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
      >
        <Sparkles size={12} className="text-accent" />
        <span className="tabular">
          {remaining > 0
            ? `${remaining} free regrade${remaining === 1 ? '' : 's'} left`
            : 'Out of free regrades'}
        </span>
        <span className="text-accent">Sign up →</span>
      </motion.button>
    </AnimatePresence>
  );
}
