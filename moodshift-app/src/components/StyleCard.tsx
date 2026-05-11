import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StylePreset } from '../types';
import { SAMPLE_PHOTOS } from '../data/styles';
import { useAppStore } from '../stores/useAppStore';

interface Props {
  style: StylePreset;
  index: number;
  total: number;
  onTry: () => void;
}

export function StyleCard({ style, index, total, onTry }: Props) {
  const photo = SAMPLE_PHOTOS[style.previewIndex % SAMPLE_PHOTOS.length];
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = favorites.has(style.id);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-primary">
      {/* Background image with applied filter */}
      <motion.img
        key={style.id}
        src={photo.src}
        alt={style.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: style.filter, willChange: 'transform' }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      />

      {/* Overlay color (matches saved render) */}
      {style.overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: style.overlay.color,
            opacity: style.overlay.opacity,
            mixBlendMode: style.overlay.blend as any,
          }}
        />
      )}

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
      {/* Top vignette for counter + heart */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

      {/* Top-left counter */}
      <div className="absolute left-4 top-9 z-10">
        <span className="chip tabular text-white">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
      </div>

      {/* Top-right heart */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(style.id);
        }}
        className="absolute right-4 top-9 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-white/10"
      >
        <motion.div
          key={isFav ? 'on' : 'off'}
          initial={{ scale: isFav ? 0.7 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        >
          <Heart
            size={20}
            strokeWidth={2.2}
            className={isFav ? 'fill-accent text-accent' : 'text-white'}
          />
        </motion.div>
      </motion.button>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-28 pt-10">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.45, ease: 'easeOut' }}
        >
          <h2 className="text-[28px] font-extrabold uppercase tracking-[0.05em] leading-[1.05] text-white">
            {style.name}
          </h2>
          <p className="mt-2 max-w-[300px] text-[14px] text-white/80">
            {style.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {style.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={onTry}
            className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-accent to-gradient-end px-6 py-3 text-[14px] font-semibold text-white shadow-glow"
          >
            <Sparkles size={16} strokeWidth={2.4} />
            Try This Style
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
