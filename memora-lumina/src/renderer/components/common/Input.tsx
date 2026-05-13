import React from 'react';
import { cn } from '@renderer/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, prefix, suffix, ...rest }, ref) => {
  return (
    <div className={cn(
      'flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-surface-card transition-colors focus-within:border-accent',
      className,
    )}>
      {prefix ? <span className="text-text-muted flex-shrink-0">{prefix}</span> : null}
      <input
        ref={ref}
        {...rest}
        className="flex-1 min-w-0 bg-transparent text-text-primary placeholder:text-text-muted outline-none border-none focus-visible:outline-none"
        style={{ outline: 'none' }}
      />
      {suffix ? <span className="text-text-muted flex-shrink-0">{suffix}</span> : null}
    </div>
  );
});
Input.displayName = 'Input';
