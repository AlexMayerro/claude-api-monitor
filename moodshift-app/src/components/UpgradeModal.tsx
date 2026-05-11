import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const FEATURES = [
  'Unlimited regrades',
  'HD export (4K resolution)',
  'Priority processing',
  '10 exclusive Pro-only styles',
  'No watermark',
];

export function UpgradeModal() {
  const open = useAppStore((s) => s.upgradeOpen);
  const setOpen = useAppStore((s) => s.setUpgradeOpen);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-[60] bg-black/65 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="absolute inset-x-5 top-1/2 z-[61] -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-bg-secondary p-6"
          >
            <div className="absolute -top-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70"
            >
              <X size={14} />
            </button>
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-gradient-end shadow-glow">
                <Sparkles size={22} className="text-white" />
              </div>
              <h3 className="mt-4 text-center text-[22px] font-extrabold text-white">
                Unlock Unlimited
              </h3>
              <p className="mt-1 text-center text-[13px] text-text-secondary">
                You've used all 5 free regrades today. Go Pro to unlock:
              </p>
              <ul className="mt-5 space-y-2.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-white">
                    <span className="text-accent">✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-accent/30 bg-bg-tertiary p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-muted">
                      Pro · billed monthly
                    </p>
                    <p className="text-[20px] font-bold text-white tabular">$4.99/mo</p>
                  </div>
                  <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                    7-day trial
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-accent to-gradient-end py-3 text-[14px] font-semibold text-white shadow-glow"
                >
                  Start Free Trial
                </motion.button>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-3 w-full py-2 text-center text-[13px] text-text-muted"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
