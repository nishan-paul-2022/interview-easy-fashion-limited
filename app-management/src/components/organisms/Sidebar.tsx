'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Icon, IconName } from '@/components/atoms/Icon';
import { useSidebar } from '@/context/SidebarContext';

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Categories', href: '/categories', icon: 'Folder' },
  { label: 'Products', href: '/products', icon: 'Package' },
  { label: 'Sizes', href: '/sizes', icon: 'Ruler' },
  { label: 'Styles', href: '/styles', icon: 'Palette' },
  { label: 'Orders', href: '/orders', icon: 'ShoppingBag' },
  { label: 'Users', href: '/users', icon: 'Users' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen bg-surface border-r border-muted/20 transition-all duration-300 z-50 flex flex-col shrink-0 ${
          isCollapsed ? 'w-16' : 'w-60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo Area */}
        <div
          className={`h-16 flex items-center px-4 border-b border-muted/20 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          {isCollapsed ? (
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="EasyFashion Logo" className="h-8 w-auto" />
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-accent font-bold text-xl tracking-tight truncate hover:opacity-80 transition-opacity"
            >
              <img src="/logo.svg" alt="EasyFashion Logo" className="h-8 w-auto" />
              <span>EasyFashion</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-muted/10 outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Toggle Sidebar"
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden flex text-muted hover:text-text transition-colors p-1.5 rounded-md hover:bg-muted/10 outline-none focus-visible:ring-2 focus-visible:ring-accent ml-auto"
            aria-label="Close sidebar"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 rounded-md transition-colors relative group outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'text-accent bg-accent/10' : 'text-text hover:bg-muted/10'
                } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-md" />
                )}
                <Icon
                  name={item.icon}
                  size={20}
                  className={
                    active ? 'text-accent' : 'text-muted group-hover:text-text transition-colors'
                  }
                />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-muted/20 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 py-2.5 rounded-md text-error hover:bg-error/10 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-error ${
              isCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <Icon name="LogOut" size={20} className="text-error" />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
