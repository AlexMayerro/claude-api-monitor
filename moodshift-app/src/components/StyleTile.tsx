import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StylePreset } from '../types';
import { SAMPLE_PHOTOS } from '../data/styles';
import { useAppStore } from '../stores/useAppStore';

interface Props {
  style: StylePreset;
  onTap: () => void;
}

export function StyleTile({ style, onTap }: Props) {
  const photo = SAMPLE_PHOTOS[style.previewIndex % SAMPLE_PHOTOS.length];
  const favorites = useAppStore((s) => s.favorites);
  const isFav = favorites.has(style.id);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={onTap}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/5 bg-bg-secondary text-left"
    >
      <img
        src={photo.src}
        alt={style.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: style.filter }}
      />
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
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/65 to-transparent" />
      {isFav && (
        <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
          <Heart size={14} className="fill-accent text-accent" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="text-[14px] font-extrabold uppercase tracking-[0.05em] leading-tight text-white">
          {style.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-white/70 line-clamp-1">{style.tags.join(' · ')}</p>
      </div>
    </motion.button>
  );
}
