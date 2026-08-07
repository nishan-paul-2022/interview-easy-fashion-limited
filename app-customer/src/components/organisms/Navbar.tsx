'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useCart } from '@/context/CartContext';

export const Navbar = () => {
  const router = useRouter();
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const accountOptions = [
    { label: 'My Orders', value: '/orders' },
    { label: 'Profile', value: '/profile' },
    { label: 'Logout', value: 'logout' },
  ];

  const handleAccountAction = (value: string | string[]) => {
    const action = Array.isArray(value) ? value[0] : value;
    if (action === 'logout') {
      // Handle logout logic
      console.log('Logout');
    } else if (action) {
      router.push(action);
    }
  };

  const handleSearch = (val: string) => {
    if (val.trim()) {
      router.push(`/products?search=${encodeURIComponent(val)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-surface z-50 border-b border-muted/20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-text flex flex-col justify-center items-center w-6 h-6 gap-1 hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span
              className={`block w-5 h-0.5 bg-current rounded-full transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-current rounded-full transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-current rounded-full transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
            ></span>
          </button>

          <Link
            href="/"
            className="text-accent font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            EasyFashion
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 ml-8">
            <Link href="/" className="text-text hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link
              href="/products"
              className="text-text hover:text-accent transition-colors font-medium"
            >
              Products
            </Link>
          </div>
        </div>

        {/* Right: Search, Cart, Account */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-text hover:text-accent transition-colors"
            aria-label="Open Search"
          >
            <Icon name="Search" />
          </button>

          <Link
            href="/cart"
            className="relative text-text hover:text-accent transition-colors flex items-center"
            aria-label="Cart"
          >
            <Icon name="ShoppingBag" />
            <span className="absolute -top-1.5 -right-2 flex items-center justify-center pointer-events-none transform scale-75 origin-top-right">
              <Badge
                label={totalItems.toString()}
                variant="success"
                className="!px-1.5 !py-0 min-w-[1.5rem] flex items-center justify-center text-center"
              />
            </span>
          </Link>

          <Dropdown
            trigger={
              <button
                className="flex outline-none hover:opacity-80 transition-opacity rounded-full ring-2 ring-transparent focus:ring-accent"
                aria-label="Account Menu"
              >
                <Avatar size="sm" name="User" />
              </button>
            }
            options={accountOptions}
            onChange={handleAccountAction}
            align="right"
          />
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-surface flex items-center justify-center px-4 z-10 border-b border-muted/20">
          <div className="w-full max-w-3xl flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search products, categories, or styles..."
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-muted hover:text-error transition-colors p-2 rounded-full hover:bg-muted/10"
              aria-label="Close search"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-muted/20 p-4 flex flex-col gap-4 shadow-lg">
          <Link
            href="/"
            className="text-text hover:text-accent font-medium px-2 py-2 rounded hover:bg-muted/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-text hover:text-accent font-medium px-2 py-2 rounded hover:bg-muted/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </Link>
        </div>
      )}
    </nav>
  );
};
