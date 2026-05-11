import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Crown, ChevronRight, Sparkles, Lock } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function ProfileScreen() {
  const regrades = useAppStore((s) => s.regrades);
  const favorites = useAppStore((s) => s.favorites);
  const dailyLimit = useAppStore((s) => s.dailyLimit);
  const usedToday = useAppStore((s) => s.usedToday);
  const setUpgradeOpen = useAppStore((s) => s.setUpgradeOpen);

  const [username, setUsername] = useState('MoodShift User');
  const [darkMode, setDarkMode] = useState(true);
  const [savingHd, setSavingHd] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(true);

  const remaining = Math.max(0, dailyLimit - usedToday);
  const progressPct = Math.min(100, (usedToday / dailyLimit) * 100);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="aurora" />
      <div className="no-scrollbar relative h-full overflow-y-auto pb-28">
        <div className="px-5 pt-10">
          <h1 className="text-screen text-white">Profile</h1>
        </div>

        {/* Avatar + name */}
        <div className="mt-4 flex items-center gap-4 px-5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-bg-secondary"
          >
            <Camera size={20} className="text-white/70" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
              <Sparkles size={10} />
            </span>
          </motion.button>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-widest text-text-muted">Username</p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent text-[18px] font-semibold text-white outline-none"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
          <Stat value={regrades.length} label="Regrades" />
          <Stat value={favorites.size} label="Favorites" />
          <Stat value={Math.min(3, regrades.length)} label="Shared" />
        </div>

        {/* Subscription card */}
        <div className="mx-5 mt-5 overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary">
          <div className="relative p-4">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80">
                    Free Plan
                  </span>
                </div>
                <p className="mt-3 text-[14px] font-semibold text-white tabular">
                  {remaining} regrade{remaining === 1 ? '' : 's'} remaining today
                </p>
                <p className="text-[11px] text-text-secondary tabular">
                  {usedToday} / {dailyLimit} daily limit
                </p>
              </div>
              <Crown size={20} className="text-warning" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-gradient-end"
              />
            </div>
          </div>
          <div className="border-t border-white/5 p-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setUpgradeOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-gradient-end py-3 text-[13px] font-semibold text-white shadow-glow"
            >
              <Sparkles size={14} />
              Upgrade to Pro — $4.99/mo
            </motion.button>
            <p className="mt-2 text-center text-[11px] text-text-secondary">
              Unlimited regrades + HD export
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="mx-5 mt-5 overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary divide-y divide-white/5">
          <Toggle label="Dark Mode" value={darkMode} onChange={setDarkMode} />
          <Toggle
            label="Save in HD"
            value={savingHd}
            onChange={setSavingHd}
            locked
          />
          <Toggle label="Auto-enhance" value={autoEnhance} onChange={setAutoEnhance} />
          <LinkRow label="About MoodShift" />
          <LinkRow label="Privacy Policy" />
          <div className="px-4 py-3 text-center text-[11px] text-text-muted">
            v0.1.0 (Prototype)
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-bg-secondary p-3 text-center">
      <p className="text-[22px] font-extrabold text-white tabular">{value}</p>
      <p className="mt-0.5 text-[11px] text-text-secondary">{label}</p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  locked,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  const setUpgradeOpen = useAppStore((s) => s.setUpgradeOpen);
  return (
    <button
      onClick={() => (locked ? setUpgradeOpen(true) : onChange(!value))}
      className="flex w-full items-center justify-between px-4 py-3.5 text-left"
    >
      <span className="flex items-center gap-2 text-[14px] text-white">
        {label}
        {locked && (
          <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            <Lock size={9} /> Pro
          </span>
        )}
      </span>
      <span
        className={`relative inline-flex h-6 w-10 rounded-full transition-colors ${
          value ? 'bg-accent' : 'bg-white/15'
        }`}
      >
        <motion.span
          animate={{ x: value ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        />
      </span>
    </button>
  );
}

function LinkRow({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center justify-between px-4 py-3.5 text-left">
      <span className="text-[14px] text-white">{label}</span>
      <ChevronRight size={16} className="text-text-muted" />
    </button>
  );
}
