import React, { useEffect, useRef } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';

export interface SearchBarProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  ...props
}) => {
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchRef.current(value);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [value, debounceMs]);

  const handleClear = () => {
    onChange('');
  };

  return (
    <Input
      leftIcon="Search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rightElement={
        value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear Search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text hover:bg-muted/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <Icon name="X" size={16} />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
