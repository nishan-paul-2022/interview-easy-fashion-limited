'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useDashboardAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role === 'CUSTOMER') {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null;
  }

  return <>{children}</>;
}
