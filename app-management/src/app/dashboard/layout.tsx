import React from 'react';

import { ToastProvider } from '@/components/molecules/Toast';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Topbar } from '@/components/organisms/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
