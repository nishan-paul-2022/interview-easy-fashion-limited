import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ label, variant = 'neutral', showDot = false, className = '', ...props }, ref) => {
    const variants = {
      success: 'text-cta border-cta',
      warning: 'text-warning border-warning',
      error: 'text-error border-error',
      neutral: 'text-muted border-muted',
      info: 'text-accent border-accent',
    };

    const dotColors = {
      success: 'bg-cta',
      warning: 'bg-warning',
      error: 'bg-error',
      neutral: 'bg-muted',
      info: 'bg-accent',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} bg-surface ${className}`}
        {...props}
      >
        {showDot && (
          <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />
        )}
        {label}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
