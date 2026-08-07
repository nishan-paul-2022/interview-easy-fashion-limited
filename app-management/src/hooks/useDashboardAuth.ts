import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiClient, setTokens, clearTokens } from '@/lib/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

// Global cache for the user promise to prevent duplicate requests on mount
let userPromiseCache: Promise<User | null> | null = null;
let cachedUser: User | null = null;

export function useDashboardAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(!cachedUser);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      if (cachedUser) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      if (!userPromiseCache) {
        userPromiseCache = apiClient.get<User>('/auth/me').catch(() => null);
      }

      const userData = await userPromiseCache;

      if (mounted) {
        cachedUser = userData;
        setUser(userData);
        setIsLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    cachedUser = userData;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors during logout
    } finally {
      clearTokens();
      cachedUser = null;
      userPromiseCache = null;
      setUser(null);
      router.push('/login');
    }
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };
}
