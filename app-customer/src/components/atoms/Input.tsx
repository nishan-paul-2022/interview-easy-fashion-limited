import React from 'react';
import { Icon, IconName } from './Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, rightElement, className = '', ...props },
    ref,
  ) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-text">{label}</label>}
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              <Icon name={leftIcon} size={20} />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-surface text-text rounded-lg py-2
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon || rightElement ? 'pr-10' : 'pr-4'}
              border ${hasError ? 'border-error' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `
              .trim()
              .replace(/\s+/g, ' ')}
            {...props}
          />
          {rightElement ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {rightElement}
            </div>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              <Icon name={rightIcon} size={20} />
            </div>
          ) : null}
        </div>
        {error && <span className="text-sm text-error">{error}</span>}
        {!error && helperText && <span className="text-sm text-muted">{helperText}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
