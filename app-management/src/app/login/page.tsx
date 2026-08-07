'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { useToast } from '@/components/molecules/Toast';
import { useDashboardAuth, User } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

export default function ManagementLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useDashboardAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', { email, password });

      if (response.user.role === 'CUSTOMER') {
        toast.error(
          'Access Denied: You do not have permission to access the management dashboard.',
        );
        return;
      }

      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center shadow-inner border border-muted/10">
          <Icon name="Shield" size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Login</h1>
          <p className="text-muted text-sm mt-1">Access the Management Dashboard</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="admin@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
        >
          Login
        </Button>
      </form>
    </div>
  );
}
