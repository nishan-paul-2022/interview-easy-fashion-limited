'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { Toggle } from '@/components/atoms/Toggle';
import { Dropdown } from '@/components/molecules/Dropdown';
import { useToast } from '@/components/molecules/Toast';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, isLoading: isAuthLoading } = useDashboardAuth();

  React.useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== 'SUPER_ADMIN') {
      router.replace('/users');
      toast.error('You do not have permission to create users.');
    }
  }, [currentUser, isAuthLoading, router, toast]);

  if (isAuthLoading || (currentUser && currentUser.role !== 'SUPER_ADMIN')) {
    return null;
  }

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('MANAGER');
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/users', {
        fullName,
        email,
        phone: phone || undefined,
        role,
        isActive,
        password,
      });
      toast.success('User created successfully');
      router.push('/users');
    } catch (e: unknown) {
      const err = e as { message?: string | string[] };
      let msg = 'Failed to create user';
      if (Array.isArray(err.message)) {
        msg = err.message.join(', ');
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-12">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text">Create New User</h1>
        <p className="text-sm text-muted">Add a new administrator or manager to the dashboard.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8"
      >
        {/* Personal Details */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-text">Personal Details</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="flex flex-col gap-6 border-t border-muted/20 pt-8">
          <h2 className="text-lg font-semibold text-text">Account Settings</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Role</label>
              <Dropdown
                trigger={
                  <Button variant="outline" className="w-full justify-between" type="button">
                    {roleOptions.find((o) => o.value === role)?.label || 'Select Role'}
                  </Button>
                }
                options={roleOptions}
                value={role}
                onChange={(val) => setRole(val as string)}
              />
            </div>

            <div className="flex h-full items-end pb-2">
              <Toggle
                label="Active Status"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="flex flex-col gap-6 border-t border-muted/20 pt-8">
          <h2 className="text-lg font-semibold text-text">Security</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <PasswordInput
              label="Password"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-end gap-4 border-t border-muted/20 pt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/users')}
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save User
          </Button>
        </div>
      </form>
    </div>
  );
}
