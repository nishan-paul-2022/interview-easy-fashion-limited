import React, { useEffect, useRef } from 'react';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';

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
            className="text-muted hover:text-text focus:outline-none transition-colors p-1"
            aria-label="Clear search"
          >
            <Icon name="X" size={16} />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
