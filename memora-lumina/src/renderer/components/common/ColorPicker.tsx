import React from 'react';
import { cn } from '@renderer/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (v: string) => void;
  presets?: { name: string; value: string }[];
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, presets, className }) => {
  return (
    <div className={cn('flex items-center gap-3 flex-wrap', className)}>
      {presets?.map((p) => (
        <button
          key={p.value}
          type="button"
          title={p.name}
          onClick={() => onChange(p.value)}
          className={cn(
            'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
            value.toLowerCase() === p.value.toLowerCase() ? 'border-text-primary scale-110' : 'border-border',
          )}
          style={{ background: p.value }}
        />
      ))}
      <label className="flex items-center gap-2 ml-1 cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-border bg-transparent cursor-pointer"
        />
        <span className="text-text-secondary text-[12px] font-mono">{value.toUpperCase()}</span>
      </label>
    </div>
  );
};
