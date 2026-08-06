'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Icon } from '@/components/atoms/Icon';
import { Dropdown } from '@/components/molecules/Dropdown';

export const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (!pathname || pathname === '/dashboard') return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return 'Dashboard';
    return lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAccountAction = (value: string | string[]) => {
    if (value === 'profile') {
      router.push('/dashboard/profile');
    } else if (value === 'logout') {
      router.push('/login');
    }
  };

  const accountOptions = [
    { label: 'Profile', value: 'profile' },
    { label: 'Logout', value: 'logout' },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-muted/20 shrink-0">
      <h1 className="text-xl font-semibold text-text">{getPageTitle()}</h1>

      <div className="flex items-center gap-6">
        <button
          className="text-muted hover:text-text transition-colors relative"
          aria-label="Notifications"
        >
          <Icon name="AlertTriangle" size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface" />
        </button>

        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar name="Admin User" size="sm" />
              <Icon name="ChevronRight" size={16} className="text-muted rotate-90" />
            </div>
          }
          options={accountOptions}
          onChange={handleAccountAction}
        />
      </div>
    </header>
  );
};
