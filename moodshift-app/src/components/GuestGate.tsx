import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { AuthMethod } from '../types';

const PERKS = [
  '5 free regrades every day',
  'Build your private style library',
  'Sync favorites across devices',
  'Save full-resolution exports',
];

export function GuestGate() {
  const open = useAppStore((s) => s.guestGateOpen);
  const setOpen = useAppStore((s) => s.setGuestGateOpen);
  const signInAs = useAppStore((s) => s.signInAs);
  const guestLimit = useAppStore((s) => s.guestLimit);

  const handleSocial = (method: AuthMethod) => {
    signInAs(method);
    setOpen(false);
  };

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
                You're hooked, aren't you?
              </h3>
              <p className="mt-1 text-center text-[13px] text-text-secondary">
                You've used all {guestLimit} guest regrades. Sign up to keep going — it's free.
              </p>

              <ul className="mt-5 space-y-2">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[13px] text-white">
                    <span className="text-accent">✦</span>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSocial('apple')}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-semibold text-black"
                >
                  <svg width="13" height="14" viewBox="0 0 16 18" fill="currentColor">
                    <path d="M11.62 0c.08 1.08-.36 2.15-.94 2.93-.62.83-1.6 1.47-2.57 1.4-.09-1.06.41-2.16.96-2.85C9.7.65 10.77.06 11.62 0Zm3.18 13.46c-.36.79-.53 1.15-.99 1.85-.65.97-1.56 2.18-2.7 2.19-1 .01-1.26-.65-2.62-.64-1.37.01-1.65.65-2.66.64-1.13-.01-1.99-1.1-2.64-2.07C.31 12.7.13 9.18 1.27 7.31c.81-1.33 2.09-2.1 3.29-2.1 1.22 0 1.99.67 3 .67.97 0 1.56-.68 2.97-.68 1.07 0 2.2.58 3 1.59-2.64 1.45-2.21 5.21.27 6.67Z" />
                  </svg>
                  Sign up with Apple
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSocial('google')}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-semibold text-[#202124]"
                >
                  <svg width="15" height="15" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.78 2.71v2.25h2.88c1.68-1.55 2.7-3.83 2.7-6.61z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.88-2.25c-.8.54-1.83.86-3.08.86-2.37 0-4.38-1.6-5.1-3.75H.96v2.32A9 9 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.9 10.68a5.42 5.42 0 0 1 0-3.36V5H.96a9 9 0 0 0 0 8l2.94-2.32z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 5L3.9 7.32C4.62 5.17 6.63 3.58 9 3.58z" />
                  </svg>
                  Sign up with Google
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSocial('facebook')}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1877F2] text-[13px] font-semibold text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.408.593 24 1.325 24H12.82V14.706h-3.13v-3.62h3.13V8.41c0-3.1 1.893-4.79 4.66-4.79 1.325 0 2.464.1 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.764v2.31h3.59l-.467 3.62h-3.123V24h6.116c.73 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                  </svg>
                  Sign up with Facebook
                </motion.button>
              </div>
              <button
                onClick={() => handleSocial('email')}
                className="mt-3 w-full py-2 text-center text-[12px] text-text-secondary"
              >
                Use email instead
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
