'use client';

import React, { createContext, useContext } from 'react';

// RadioGroup Context
interface RadioGroupContextType {
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

// RadioGroup Component
export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  label,
  orientation = 'vertical',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      role="radiogroup"
      aria-labelledby={label ? `${name}-label` : undefined}
      {...props}
    >
      {label && (
        <span id={`${name}-label`} className="text-sm font-semibold text-text">
          {label}
        </span>
      )}
      <div
        className={`flex gap-3 ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}`}
      >
        <RadioGroupContext.Provider value={{ name, value, onChange }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';

// Radio Component
export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name'
> {
  label: string;
  value: string | number;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, value, className = '', ...props }, ref) => {
    const groupContext = useContext(RadioGroupContext);

    const isChecked = groupContext ? groupContext.value === value : props.checked;
    const name = groupContext ? groupContext.name : undefined;
    const onChange = groupContext?.onChange || props.onChange;

    return (
      <label
        className={`inline-flex items-center gap-2 cursor-pointer ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            ref={ref}
            name={name}
            value={value}
            checked={isChecked}
            onChange={onChange}
            className="peer appearance-none w-5 h-5 border-2 border-muted rounded-full bg-surface checked:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg transition-colors duration-200"
            {...props}
          />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-accent opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
        <span className="text-sm font-medium text-text select-none">{label}</span>
      </label>
    );
  },
);

Radio.displayName = 'Radio';
