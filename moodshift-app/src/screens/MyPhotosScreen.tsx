import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Download, Trash2, RefreshCw, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { STYLES } from '../data/styles';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { renderStyledImage } from '../utils/applyFilter';
import { downloadDataUrl } from '../utils/imageHelpers';
import type { RegradedPhoto } from '../types';

export function MyPhotosScreen() {
  const regrades = useAppStore((s) => s.regrades);
  const removeRegrade = useAppStore((s) => s.removeRegrade);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setPendingStyleId = useAppStore((s) => s.setPendingStyleId);
  const setPendingSrc = useAppStore((s) => s.setPendingSrc);

  const [selected, setSelected] = useState<RegradedPhoto | null>(null);

  const stylesById = (id: string) => STYLES.find((s) => s.id === id);

  const handleSave = async (photo: RegradedPhoto) => {
    const preset = stylesById(photo.styleId);
    if (!preset) return;
    const url = await renderStyledImage(photo.originalSrc, preset, photo.intensity, 2400);
    downloadDataUrl(url, `moodshift-${photo.styleId}.jpg`);
  };

  if (regrades.length === 0) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="aurora" />
        <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 -m-6 rounded-full bg-accent/25 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-bg-secondary border border-white/8">
              <Camera size={28} className="text-white" />
              <Sparkles size={14} className="absolute -right-1 -top-1 text-accent" />
            </div>
          </div>
          <h2 className="text-[22px] font-bold text-white">No regrades yet</h2>
          <p className="mt-2 text-[13px] text-text-secondary">
            Upload a photo and transform its mood with one tap.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab('discover')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-gradient-end px-6 py-3 text-[14px] font-semibold text-white shadow-glow"
          >
            <Sparkles size={16} />
            Get Started
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="aurora" />
      <div className="relative flex h-full flex-col">
        <div className="px-5 pt-10 pb-3">
          <h1 className="text-screen text-white">My Photos</h1>
          <p className="text-[13px] text-text-secondary tabular">
            {regrades.length} regrade{regrades.length === 1 ? '' : 's'} this session
          </p>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
          <div className="grid grid-cols-2 gap-3">
            {regrades.map((p) => {
              const preset = stylesById(p.styleId);
              return (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelected(p)}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/8 bg-bg-secondary"
                >
                  <img
                    src={p.originalSrc}
                    alt={p.styleName}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ filter: preset?.filter }}
                  />
                  {preset?.overlay && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundColor: preset.overlay.color,
                        opacity: preset.overlay.opacity * p.intensity,
                        mixBlendMode: preset.overlay.blend as any,
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {p.styleName}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-screen viewer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col bg-bg-primary"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-9">
              <button
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/85"
              >
                <X size={18} />
              </button>
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
                {selected.styleName}
              </span>
              <div className="h-9 w-9" />
            </div>
            <div className="relative flex-1 overflow-hidden">
              {stylesById(selected.styleId) && (
                <BeforeAfterSlider
                  src={selected.originalSrc}
                  preset={stylesById(selected.styleId)!}
                  intensity={selected.intensity}
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/5 bg-bg-secondary/70 p-4 backdrop-blur-xl">
              <Tool
                icon={<Download size={18} />}
                label="Save"
                onClick={() => handleSave(selected)}
              />
              <Tool
                icon={<RefreshCw size={18} />}
                label="Re-edit"
                onClick={() => {
                  setPendingSrc(selected.originalSrc);
                  setPendingStyleId(selected.styleId);
                  setSelected(null);
                }}
              />
              <Tool
                icon={<Trash2 size={18} />}
                label="Delete"
                danger
                onClick={() => {
                  removeRegrade(selected.id);
                  setSelected(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tool({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl border border-white/8 bg-bg-tertiary px-3 py-3 text-[11px] font-semibold ${
        danger ? 'text-error' : 'text-white/85'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
