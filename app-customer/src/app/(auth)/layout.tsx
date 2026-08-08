import Link from 'next/link';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-muted/20 bg-surface p-8 shadow-lg relative">
        {/* Brand Header */}
        <div className="flex justify-center flex-col items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-accent font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="EasyFashion Logo" className="h-10 w-auto" />
            <span>EasyFashion</span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
