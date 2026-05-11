import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  styleName: string;
  src: string;
  onDone: () => void;
}

const STAGES = ['Shifting mood...', 'Applying %s...', 'Almost there...'];

export function ProcessingOverlay({ styleName, src, onDone }: Props) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStageIdx(1), 700);
    const t2 = setTimeout(() => setStageIdx(2), 1500);
    const t3 = setTimeout(onDone, 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  const label = STAGES[stageIdx].replace('%s', styleName);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-30 bg-bg-primary"
    >
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="shimmer-sweep absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
        {/* Spinner */}
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-accent/25 blur-2xl ms-pulse" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="60 200"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{ transformOrigin: '50% 50%' }}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[16px] font-semibold text-white"
        >
          {label}
        </motion.p>
        <p className="text-center text-[12px] text-text-secondary">
          On-device cinematic regrade
        </p>
      </div>
    </motion.div>
  );
}
