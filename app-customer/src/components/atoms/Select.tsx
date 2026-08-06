import React from 'react';
import { Icon } from './Icon';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-text">{label}</label>}
        <div className="relative w-full">
          <select
            ref={ref}
            className={`
              w-full bg-surface text-text rounded-lg py-2 pl-4 pr-10 appearance-none
              border ${hasError ? 'border-error' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `
              .trim()
              .replace(/\s+/g, ' ')}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
            {/* Using ChevronRight rotated by 90 deg because ChevronDown is not in allowed token list */}
            <Icon name="ChevronRight" size={20} className="rotate-90" />
          </div>
        </div>
        {error && <span className="text-sm text-error">{error}</span>}
        {!error && helperText && <span className="text-sm text-muted">{helperText}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
