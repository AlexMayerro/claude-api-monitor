import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Download, Share2, Shuffle, SplitSquareVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { StylePreset } from '../types';
import { STYLES } from '../data/styles';
import { blendedFilter, renderStyledImage } from '../utils/applyFilter';
import { downloadDataUrl } from '../utils/imageHelpers';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useAppStore } from '../stores/useAppStore';

interface Props {
  src: string;
  preset: StylePreset;
  onBack: () => void;
  onTryAnother: () => void;
}

export function ResultScreen({ src, preset, onBack, onTryAnother }: Props) {
  const [intensity, setIntensity] = useState(0.8);
  const [compare, setCompare] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const addRegrade = useAppStore((s) => s.addRegrade);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(t);
  }, []);

  const cssFilter = useMemo(() => blendedFilter(preset, intensity), [preset, intensity]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const handleSave = async () => {
    const dataUrl = await renderStyledImage(src, preset, intensity, 2400);
    downloadDataUrl(dataUrl, `moodshift-${preset.id}.jpg`);
    addRegrade({
      id: `${preset.id}-${Date.now()}`,
      originalSrc: src,
      styleId: preset.id,
      styleName: preset.name,
      intensity,
      createdAt: new Date().toISOString(),
    });
    showToast('Saved to device');
  };

  const handleShare = async () => {
    try {
      const dataUrl = await renderStyledImage(src, preset, intensity, 1600);
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `moodshift-${preset.id}.jpg`, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: preset.name, text: `Regraded with MoodShift — ${preset.name}` });
          return;
        }
      }
      await navigator.clipboard?.writeText(`MoodShift · ${preset.name}`);
      showToast('Copied to clipboard');
    } catch {
      showToast('Share unavailable');
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg-primary">
      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pb-2 pt-9">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/85 backdrop-blur-md"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md border border-white/8"
        >
          {preset.name}
        </button>
        <div className="h-9 w-9" />
      </div>

      {/* Image area */}
      <div className="relative flex-1 overflow-hidden">
        {compare ? (
          <BeforeAfterSlider src={src} preset={preset} intensity={intensity} />
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
            animate={
              revealed
                ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                : { opacity: 0, scale: 1.03, filter: 'blur(6px)' }
            }
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <img
              src={src}
              alt="result"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: cssFilter }}
            />
            {preset.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: preset.overlay.color,
                  opacity: preset.overlay.opacity * intensity,
                  mixBlendMode: preset.overlay.blend as any,
                }}
              />
            )}
          </motion.div>
        )}

        {/* Info panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-4 right-4 top-3 z-10 rounded-2xl border border-white/10 bg-bg-secondary/90 p-4 backdrop-blur-xl"
            >
              <p className="text-[15px] font-semibold text-white">{preset.name}</p>
              <p className="mt-1 text-[12px] text-text-secondary">{preset.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preset.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls panel */}
      <div className="relative z-20 border-t border-white/5 bg-bg-secondary/70 px-5 pb-5 pt-4 backdrop-blur-xl">
        {/* Intensity slider */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Intensity</span>
            <span className="text-[12px] font-semibold tabular text-white">
              {Math.round(intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(intensity * 100)}
            onChange={(e) => setIntensity(Number(e.target.value) / 100)}
            className="ms-range"
            style={{ ['--val' as any]: `${Math.round(intensity * 100)}%` }}
          />
        </div>

        {/* Style strip */}
        <div className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
          {[preset, ...STYLES.filter((s) => s.id !== preset.id).slice(0, 12)].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                if (s.id !== preset.id) {
                  // Re-route through "try another" with this style
                  useAppStore.getState().setPendingStyleId(s.id);
                  useAppStore.getState().setPendingSrc(src);
                }
              }}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border ${
                s.id === preset.id ? 'border-accent shadow-glow-sm' : 'border-white/8'
              }`}
            >
              <img
                src={src}
                alt={s.name}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: s.filter }}
              />
            </button>
          ))}
        </div>

        {/* Action row */}
        <div className="grid grid-cols-4 gap-2">
          <ActionBtn label="Save" onClick={handleSave} icon={<Download size={18} />} primary />
          <ActionBtn
            label={compare ? 'Hide' : 'Compare'}
            onClick={() => setCompare((v) => !v)}
            icon={<SplitSquareVertical size={18} />}
          />
          <ActionBtn label="Restyle" onClick={onTryAnother} icon={<Shuffle size={18} />} />
          <ActionBtn label="Share" onClick={handleShare} icon={<Share2 size={18} />} />
        </div>
      </div>

      {/* Save toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none absolute bottom-32 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-success/90 px-4 py-2 text-[13px] font-semibold text-white shadow-lg"
          >
            <Check size={14} strokeWidth={3} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  primary,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-[11px] font-semibold ${
        primary
          ? 'border-transparent bg-gradient-to-r from-accent to-gradient-end text-white shadow-glow-sm'
          : 'border-white/8 bg-bg-tertiary text-white/85'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
