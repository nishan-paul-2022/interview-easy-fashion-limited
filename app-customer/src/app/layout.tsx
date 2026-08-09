import type { Metadata } from 'next';
import { ToastProvider } from '@/components/molecules/Toast';
import { CartProvider } from '@/context/CartContext';

import './globals.css';

export const metadata: Metadata = {
  title: 'Easy Fashion Customer',
  description: 'Easy Fashion E-Commerce Customer Store',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg text-text">
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
