'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { useToast } from '@/components/molecules/Toast';
import { useAuth, User } from '@/hooks/useAuth';
import { apiClient, setTokens, clearTokens } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('accessToken');
      const refresh = params.get('refreshToken');
      if (token && refresh) {
        try {
          setTokens(token, refresh);
          const userData = await apiClient.get<User>('/auth/me');
          login(userData, token, refresh);
          toast.success('Successfully logged in!');
          router.push('/');
        } catch {
          clearTokens();
          toast.error('Failed to complete login callback');
        }
      }
    };
    handleOAuthCallback();
  }, [router, login, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', data);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text">Welcome back</h2>
        <p className="mt-2 text-sm text-muted">Please sign in to your account</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1">
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-1">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-accent hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

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

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-2 text-muted">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          leftIcon="Package"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
          }}
        >
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          className="w-full"
          leftIcon="Users"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
          }}
        >
          Facebook
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
