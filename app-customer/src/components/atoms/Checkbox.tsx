'use client';

import React, { useEffect, useRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, indeterminate = false, className = '', ...props }, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.MutableRefObject<HTMLInputElement>) || defaultRef;

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <label
        className={`inline-flex items-center gap-2 cursor-pointer ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={resolvedRef}
            aria-checked={indeterminate ? 'mixed' : props.checked}
            className={`peer appearance-none w-5 h-5 border-2 border-muted rounded-sm bg-surface transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg ${
              indeterminate ? 'bg-accent border-accent' : 'checked:bg-accent checked:border-accent'
            }`}
            {...props}
          />
          {indeterminate ? (
            <svg
              className="absolute w-3.5 h-3.5 text-bg pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ) : (
            <svg
              className="absolute w-3.5 h-3.5 text-bg pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        {label && <span className="text-sm font-medium text-text select-none">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
