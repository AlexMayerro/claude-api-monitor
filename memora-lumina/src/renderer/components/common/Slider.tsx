import React from 'react';
import { cn } from '@renderer/lib/utils';

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  formatValue?: (v: number) => string;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step = 1, className, formatValue }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      <div className="flex-1 relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-surface-active" />
        <div
          className="absolute h-1 rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
          style={{ outline: 'none' }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-accent shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="min-w-[3.5rem] text-right text-text-secondary tabular-nums text-[13px]">
        {formatValue ? formatValue(value) : value}
      </div>
    </div>
  );
};
