import React, { useRef, useEffect, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, autoResize = false, className = '', onChange, id, ...props },
    ref,
  ) => {
    const hasError = !!error;
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const generatedId = useId();
    const textareaId = id || generatedId;

    const setRefs = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const handleAutoResize = React.useCallback(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    useEffect(() => {
      handleAutoResize();
    }, [props.value, handleAutoResize]);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={setRefs}
          onChange={(e) => {
            handleAutoResize();
            onChange?.(e);
          }}
          className={`
            w-full bg-surface text-text rounded-lg px-4 py-2
            border ${hasError ? 'border-error' : 'border-transparent'}
            focus:outline-none focus:ring-2 focus:ring-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${autoResize ? 'resize-none overflow-hidden' : ''}
            ${className}
          `
            .trim()
            .replace(/\s+/g, ' ')}
          {...props}
        />
        {error && <span className="text-sm text-error">{error}</span>}
        {!error && helperText && <span className="text-sm text-muted">{helperText}</span>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
