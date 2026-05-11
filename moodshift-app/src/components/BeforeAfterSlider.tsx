import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { StylePreset } from '../types';
import { blendedFilter } from '../utils/applyFilter';

interface Props {
  src: string;
  preset: StylePreset;
  intensity: number;
  /** Show a thin label "BEFORE / AFTER" on the divider. */
  showLabels?: boolean;
}

/**
 * Draggable vertical divider that reveals the styled image on one side and the
 * original on the other. Container is fully responsive within its parent.
 */
export function BeforeAfterSlider({ src, preset, intensity, showLabels = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const widthPct = useTransform(x, (v) => `${v * 100}%`);
  const filter = blendedFilter(preset, intensity);

  const updateFromClientX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0.02, Math.min(0.98, (clientX - rect.left) / rect.width));
    x.set(pct);
  };

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-bg-primary touch-none select-none"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons) updateFromClientX(e.clientX);
      }}
    >
      {/* Base: styled image */}
      <img
        src={src}
        alt="after"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter }}
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

      {/* Top layer: original, clipped from the right */}
      <motion.div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: widthPct }}
      >
        <img
          src={src}
          alt="before"
          className="absolute inset-y-0 left-0 h-full object-cover"
          style={{ width: ref.current ? `${ref.current.clientWidth}px` : '100%' }}
        />
      </motion.div>

      {/* Divider */}
      <motion.div
        className="absolute inset-y-0 z-10 -ml-px w-0.5 bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
        style={{ left: widthPct }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-bg-primary shadow-[0_0_24px_rgba(139,92,246,0.6)]">
          <ChevronLeft size={14} strokeWidth={3} />
          <ChevronRight size={14} strokeWidth={3} className="-ml-0.5" />
        </div>
      </motion.div>

      {showLabels && (
        <>
          <div className="absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            Before
          </div>
          <div className="absolute right-3 top-3 z-10 rounded-full bg-accent/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            After
          </div>
        </>
      )}
    </div>
  );
}
