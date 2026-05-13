import React, { useState } from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ label, children, side = 'top' }) => {
  const [open, setOpen] = useState(false);
  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[side];
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open ? (
        <span
          className={`absolute z-50 whitespace-nowrap pointer-events-none ${positionClass} px-2 py-1 text-[12px] rounded-md bg-surface-elevated text-text-primary border border-border shadow-elevated`}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
};
