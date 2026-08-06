import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ToastProvider } from '../components/molecules/Toast';
import { Footer } from '../components/organisms/Footer';
import { Navbar } from '../components/organisms/Navbar';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} antialiased bg-bg text-text`}>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
