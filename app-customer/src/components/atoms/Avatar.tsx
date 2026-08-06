import React, { useState } from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = 'Avatar', name, size = 'md', className = '', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-xl',
    };

    const getInitials = (name?: string) => {
      if (!name) return '';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(name);

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-surface text-accent shrink-0 ${sizes[size]} ${className}`}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-medium tracking-wide uppercase">{initials}</span>
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
