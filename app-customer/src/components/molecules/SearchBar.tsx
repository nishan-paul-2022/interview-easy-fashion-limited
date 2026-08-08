import React from 'react';
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
  debounceMs, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...props
}) => {
  const handleClear = () => {
    onChange('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <Input
      leftIcon="Search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
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
