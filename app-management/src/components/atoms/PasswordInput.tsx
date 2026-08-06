import React, { useState } from 'react';

import { Icon } from '@/components/atoms/Icon';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-text">{label}</label>}
        <div className="relative w-full">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            className={`
              w-full bg-surface text-text rounded-lg py-2 pl-4 pr-10 min-h-[44px]
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
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text focus:outline-none transition-colors"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {/* EyeOff icon alternative: using Eye with strike-through line since EyeOff is not in allowed Lucide tokens */}
            <div className="relative flex items-center justify-center">
              <Icon name="Eye" size={20} className={show ? 'text-accent' : 'text-muted'} />
              {!show && <div className="absolute w-5 h-[2px] bg-muted rotate-45" />}
            </div>
          </button>
        </div>
        {error && <span className="text-sm text-error">{error}</span>}
        {!error && helperText && <span className="text-sm text-muted">{helperText}</span>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
