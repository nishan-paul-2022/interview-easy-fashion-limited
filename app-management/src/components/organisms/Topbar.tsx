'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Icon } from '@/components/atoms/Icon';
import { Dropdown } from '@/components/molecules/Dropdown';
import { useSidebar } from '@/context/SidebarContext';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

export const Topbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsMobileOpen } = useSidebar();
  const { user } = useDashboardAuth();

  const getPageTitle = () => {
    if (!pathname || pathname === '/') {
      return 'Dashboard';
    }
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
      return 'Dashboard';
    }
    return lastPart
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAccountAction = (value: string | string[]) => {
    if (value === 'profile') {
      router.push('/profile');
    } else if (value === 'logout') {
      router.push('/login');
    }
  };

  const accountOptions = [
    { label: 'Profile', value: 'profile' },
    { label: 'Logout', value: 'logout' },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-surface border-b border-muted/20 shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="md:hidden text-muted hover:text-text transition-colors p-1 -ml-1 rounded-md hover:bg-muted/10 outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Icon name="Menu" size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-text truncate">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <Avatar name={user?.fullName || 'Admin User'} size="sm" />
            </div>
          }
          options={accountOptions}
          onChange={handleAccountAction}
        />
      </div>
    </header>
  );
};
