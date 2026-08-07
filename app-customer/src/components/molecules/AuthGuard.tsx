'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { useAuth } from '@/hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-bg">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
