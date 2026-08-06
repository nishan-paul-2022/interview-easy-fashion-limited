import React from 'react';

import { Footer } from '@/components/organisms/Footer';
import { Navbar } from '@/components/organisms/Navbar';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
