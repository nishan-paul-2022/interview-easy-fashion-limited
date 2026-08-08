'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { useToast } from '@/components/molecules/Toast';
import { useAuth, User } from '@/hooks/useAuth';
import { apiClient, setTokens, clearTokens } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (processed.current) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const token = params.get('accessToken');
      const refresh = params.get('refreshToken');

      if (token && refresh) {
        processed.current = true;
        try {
          setTokens(token, refresh);
          const userData = await apiClient.get<User>('/auth/me');
          login(userData, token, refresh);
          toast.success('Successfully logged in!');
          router.push('/');
        } catch {
          clearTokens();
          toast.error('Failed to complete login callback');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };
    handleCallback();
  }, [router, login, toast]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4 bg-bg text-center">
      <Icon name="Search" size={48} className="animate-spin text-accent" />
      <h2 className="text-xl font-bold text-text">Completing authentication...</h2>
      <p className="text-sm text-muted">Please wait while we set up your session.</p>
    </div>
  );
}
