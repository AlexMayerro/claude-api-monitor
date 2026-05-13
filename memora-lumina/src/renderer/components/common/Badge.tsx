import React from 'react';
import { cn } from '@renderer/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-surface-active text-text-secondary border-border',
  accent: 'bg-accent-subtle text-accent border-accent/30',
  success: 'bg-[var(--success-bg)] text-success border-success/30',
  warning: 'bg-[var(--warning-bg)] text-warning border-warning/30',
  error: 'bg-[var(--error-bg)] text-error border-error/30',
  info: 'bg-[var(--info-bg)] text-info border-info/30',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
