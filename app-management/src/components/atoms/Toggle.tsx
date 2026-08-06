'use client';

import React from 'react';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label
        className={`inline-flex items-center gap-3 cursor-pointer ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {label && <span className="text-sm font-medium text-text select-none">{label}</span>}
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            role="switch"
            className="peer appearance-none w-11 h-6 rounded-full bg-surface border-2 border-muted checked:border-accent checked:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg transition-colors duration-300 ease-in-out"
            {...props}
          />
          <div className="absolute left-1 top-1 w-4 h-4 bg-muted rounded-full peer-checked:bg-bg peer-checked:translate-x-5 transition-transform duration-300 ease-in-out pointer-events-none shadow-sm" />
        </div>
      </label>
    );
  },
);

Toggle.displayName = 'Toggle';
