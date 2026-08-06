import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../atoms/Icon';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  value,
  onChange,
  multiple = false,
  className = '',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.includes(optionValue)) {
        onChange(currentValue.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValue, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 min-w-[200px] bg-surface border border-muted/30 
            rounded-lg shadow-lg overflow-hidden flex flex-col max-h-60 overflow-y-auto
            ${align === 'right' ? 'right-0' : 'left-0'}
          `
            .trim()
            .replace(/\s+/g, ' ')}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted text-center">No options available</div>
          ) : (
            options.map((option) => {
              const selected = isSelected(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors duration-200 
                    flex items-center justify-between hover:bg-muted/10 focus:outline-none
                    ${selected ? 'text-accent bg-accent/5 font-medium' : 'text-text'}
                  `
                    .trim()
                    .replace(/\s+/g, ' ')}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && (
                    <Icon name="CheckCircle" size={16} className="text-accent ml-3 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
