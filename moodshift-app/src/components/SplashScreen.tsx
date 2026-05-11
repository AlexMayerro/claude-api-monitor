import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

export function SplashScreen() {
  const setSplashDone = useAppStore((s) => s.setSplashDone);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(t);
  }, [setSplashDone]);

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-bg-primary"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="aurora" />
      <div className="relative flex flex-col items-center gap-5">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 -m-6 rounded-full bg-accent/30 blur-2xl" />
          <svg width="72" height="72" viewBox="0 0 64 64" className="relative">
            <defs>
              <linearGradient id="splashg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <path
              d="M32 10l5.5 11.5L50 26l-9 8.6L43 48 32 41.8 21 48l2-13.4L14 26l12.5-4.5z"
              fill="url(#splashg)"
            />
          </svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[32px] font-extrabold tracking-tight text-white"
        >
          MoodShift
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 160 }}
          transition={{ delay: 0.3, duration: 1.5, ease: 'easeInOut' }}
          className="h-[2px] rounded-full bg-gradient-to-r from-accent to-gradient-end"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[14px] text-text-secondary"
        >
          Shift your reality
        </motion.p>
      </div>
    </motion.div>
  );
}
