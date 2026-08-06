import React from 'react';

import { Icon, IconName } from '@/components/atoms/Icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

    const variants = {
      primary: 'bg-accent text-bg hover:opacity-90',
      secondary: 'bg-surface text-text hover:brightness-110',
      outline: 'border border-muted text-text bg-transparent hover:border-accent hover:text-accent',
      ghost: 'bg-transparent text-text hover:bg-surface',
      danger: 'bg-error text-bg hover:opacity-90',
      success: 'bg-cta text-bg hover:opacity-90',
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5 gap-1.5 min-h-[44px]',
      md: 'text-base px-4 py-2 gap-2 min-h-[44px]',
      lg: 'text-lg px-6 py-3 gap-2.5 min-h-[44px]',
    };

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const renderSpinner = () => (
      <svg
        className={`animate-spin ${children ? '-ml-1 mr-1' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        style={{ width: iconSizes[size], height: iconSizes[size] }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );

    return (
      <button ref={ref} disabled={disabled || isLoading} className={classes.trim()} {...props}>
        {isLoading && renderSpinner()}
        {!isLoading && leftIcon && <Icon name={leftIcon} size={iconSizes[size]} />}
        {children}
        {!isLoading && rightIcon && <Icon name={rightIcon} size={iconSizes[size]} />}
      </button>
    );
  },
);

Button.displayName = 'Button';
