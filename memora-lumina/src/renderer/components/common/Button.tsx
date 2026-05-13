import React from 'react';
import { cn } from '@renderer/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-5 text-[15px] rounded-md',
};

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-text-inverse hover:bg-accent-hover disabled:opacity-50',
  secondary: 'bg-surface-elevated text-text-primary hover:bg-surface-active border border-border disabled:opacity-50',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated disabled:opacity-50',
  danger: 'bg-error text-white hover:opacity-90 disabled:opacity-50',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...rest }) => {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-ring',
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
