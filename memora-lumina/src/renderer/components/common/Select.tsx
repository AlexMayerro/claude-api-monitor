import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@renderer/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className, disabled }) => {
  return (
    <div className={cn('relative inline-flex w-full', className)}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-9 rounded-md border border-border bg-surface-card text-text-primary appearance-none cursor-pointer focus:border-accent disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
    </div>
  );
};
