import React from 'react';
import type { MemoryLayer } from '@shared/types';
import { LAYER_DOT_COLOR_VAR } from '@renderer/lib/constants';

interface Props {
  layer: MemoryLayer;
  importance: number;
  active?: boolean;
}

export const MemoryDot: React.FC<Props> = ({ layer, importance, active }) => {
  let color = LAYER_DOT_COLOR_VAR[layer];
  if (active) color = 'var(--dot-green)';
  else if (importance >= 8) color = 'var(--dot-gold)';
  return (
    <span
      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
      style={{ background: color, boxShadow: `0 0 0 2px var(--bg-primary), 0 0 0 3px ${color}33` }}
      aria-hidden
    />
  );
};
