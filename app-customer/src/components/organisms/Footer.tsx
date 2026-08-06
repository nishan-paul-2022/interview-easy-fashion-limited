import Link from 'next/link';
import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-muted/20 text-text mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-accent font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity"
            >
              EasyFashion
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              Your ultimate destination for modern, responsive, and trendy fashion collections.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-text">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-muted hover:text-accent transition-colors text-sm">
                Home
              </Link>
              <Link
                href="/products"
                className="text-muted hover:text-accent transition-colors text-sm"
              >
                Products
              </Link>
              <Link href="/cart" className="text-muted hover:text-accent transition-colors text-sm">
                Cart
              </Link>
            </div>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-text">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <p>
                Email:{' '}
                <a
                  href="mailto:support@easyfashion.com"
                  className="hover:text-accent transition-colors"
                >
                  support@easyfashion.com
                </a>
              </p>
              <p>
                Phone:{' '}
                <a href="tel:+15551234567" className="hover:text-accent transition-colors">
                  +1 (555) 123-4567
                </a>
              </p>
            </div>
          </div>

          {/* Social Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-text">Social</h3>
            <div className="flex flex-col gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-accent transition-colors text-sm"
              >
                Instagram
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-accent transition-colors text-sm"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-accent transition-colors text-sm"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Copyright */}
      <div className="border-t border-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center sm:justify-between text-sm text-muted">
          <p>&copy; {currentYear} EasyFashion Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
