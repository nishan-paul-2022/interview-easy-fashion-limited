'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { Skeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

export default function AdminProfilePage() {
  const { user, isLoading: isAuthLoading } = useDashboardAuth();
  const toast = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await apiClient.patch(`/users/${user.id}`, { fullName, phone: phone || null });
      toast.success('Profile updated successfully! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully! Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        // Will logout user and redirect to login because we cleared the refresh token
        // and the frontend will eventually catch a 401, but we can force it
        router.push('/login');
      }, 1500);
    } catch (e: unknown) {
      const err = e as { message?: string | string[] };
      let msg = 'Failed to change password';
      if (Array.isArray(err.message)) {
        msg = err.message.join(', ');
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
        <Skeleton height={200} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // @ts-expect-error role is an object in our backend payload
  const roleName = user.role?.name || user.role || 'MANAGER';

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your personal information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <div className="relative group">
              <Avatar name={user.fullName} size="lg" className="h-28 w-28 text-3xl" />
              <button
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Change Avatar"
              >
                <Icon name="Pencil" size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-text">{user.fullName}</h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <Badge label={roleName} variant={roleName === 'ADMIN' ? 'error' : 'info'} />
              {user.phone && <p className="text-xs text-muted">{user.phone}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="flex flex-col gap-8 md:col-span-2">
          {/* Edit Profile Form */}
          <form
            onSubmit={handleProfileSave}
            className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-text">Edit Profile</h2>
            <div className="flex flex-col gap-5">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" type="submit" isLoading={isUpdatingProfile}>
                Save Changes
              </Button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handlePasswordSave}
            className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-text">Change Password</h2>
            <div className="flex flex-col gap-5">
              <PasswordInput
                label="Current Password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordInput
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="primary" type="submit" isLoading={isUpdatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
