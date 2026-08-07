'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/components/molecules/Toast';
import { apiClient } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="CheckCircle" size={32} />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text">Check your email</h2>
          <p className="mt-2 text-sm text-muted">
            We sent a password reset link to <br />
            <span className="font-medium text-text">{submittedEmail}</span>
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-4 w-full">
          <Link href="/login" className="w-full">
            <Button variant="primary" size="lg" className="w-full">
              Back to Login
            </Button>
          </Link>
          <p className="text-sm text-muted">
            Didn&apos;t receive the email?{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-medium text-accent hover:underline"
            >
              Click to resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-text">Forgot password</h2>
        <p className="mt-2 text-sm text-muted">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="flex flex-col gap-5 mt-2" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-accent hover:underline flex items-center justify-center gap-2"
        >
          <Icon name="ChevronLeft" size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
