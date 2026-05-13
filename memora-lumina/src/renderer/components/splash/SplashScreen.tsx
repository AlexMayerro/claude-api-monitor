import React from 'react';
import { motion } from 'framer-motion';
import { APP_NAME, APP_TAGLINE } from '@renderer/lib/constants';

export const SplashScreen: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="splash-logo w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white text-4xl font-bold shadow-elevated"
      >
        M
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-6 text-xl font-semibold tracking-tight"
      >
        {APP_NAME}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mt-1 text-text-secondary text-sm"
      >
        {APP_TAGLINE}
      </motion.div>
    </div>
  );
};
