import React from 'react';

export default function DashboardAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-xl shadow-2xl border border-muted/20">
        {children}
      </div>
    </div>
  );
}
