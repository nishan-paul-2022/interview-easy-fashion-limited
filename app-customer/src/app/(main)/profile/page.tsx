'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Icon, IconName } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { AuthGuard } from '@/components/molecules/AuthGuard';
import { Modal } from '@/components/molecules/Modal';
import { useToast } from '@/components/molecules/Toast';
import { apiClient } from '@/lib/api';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be valid').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface OrderData {
  status: string;
}

interface PaginatedOrders {
  data: OrderData[];
}

export default function ProfilePage() {
  const toast = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setIsLoading(true);
      try {
        const [meRes, ordersRes] = await Promise.all([
          apiClient.get<ProfileData>('/auth/me'),
          apiClient.get<PaginatedOrders>('/orders/me', { limit: 100 }).catch(() => ({ data: [] })),
        ]);

        if (mounted) {
          setProfile(meRes);

          const orders = ordersRes?.data || [];
          let pending = 0;
          let delivered = 0;
          let cancelled = 0;

          orders.forEach((o) => {
            const s = (o.status || '').toUpperCase();
            if (s === 'PENDING' || s === 'PROCESSING') {
              pending++;
            } else if (s === 'DELIVERED') {
              delivered++;
            } else if (s === 'CANCELLED') {
              cancelled++;
            }
          });

          setOrderStats({
            total: orders.length,
            pending,
            delivered,
            cancelled,
          });
        }
      } catch {
        // Suppress initial load errors, let AuthGuard or empty states handle UI
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEditClick = () => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiClient.patch<ProfileData>(`/users/${profile.id}`, {
        fullName: data.fullName,
        phone: data.phone,
      });
      setProfile(res);
      setIsEditModalOpen(false);
      toast.success('Your profile information has been saved successfully.');
    } catch (error: unknown) {
      const err = error as { message?: string | string[] };
      if (err.message && Array.isArray(err.message)) {
        err.message.forEach((msg: string) => {
          if (typeof msg === 'string') {
            const m = msg.toLowerCase();
            if (m.includes('name')) {
              setError('fullName', { type: 'server', message: msg });
            } else if (m.includes('phone')) {
              setError('phone', { type: 'server', message: msg });
            } else {
              setError('root', { type: 'server', message: msg });
            }
          }
        });
      } else {
        toast.error((err.message as string) || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const STATS = [
    {
      label: 'Total Orders',
      value: orderStats.total.toString(),
      icon: 'ShoppingBag',
      color: 'text-accent',
    },
    {
      label: 'Pending',
      value: orderStats.pending.toString(),
      icon: 'Package',
      color: 'text-warning',
    },
    {
      label: 'Delivered',
      value: orderStats.delivered.toString(),
      icon: 'CheckCircle',
      color: 'text-success',
    },
    { label: 'Cancelled', value: orderStats.cancelled.toString(), icon: 'X', color: 'text-error' },
  ] as const;

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
        <h1 className="text-3xl font-bold text-text">My Profile</h1>

        {isLoading ? (
          <div className="flex min-h-[50vh] w-full items-center justify-center">
            <Icon name="Search" size={32} className="animate-spin text-muted" />
          </div>
        ) : profile ? (
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Left Column: Profile Card */}
            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center rounded-xl border border-muted/20 bg-surface p-8 shadow-sm text-center">
                <div className="relative mb-4">
                  <Avatar name={profile.fullName} size="lg" className="h-24 w-24 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold text-text">{profile.fullName}</h2>
                <p className="mb-6 text-sm text-muted">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>

                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/10">
                      <Icon name="Search" size={16} className="text-muted" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Email</span>
                      <span className="font-medium text-text">{profile.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/10">
                      <Icon name="CheckCircle" size={16} className="text-muted" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Phone</span>
                      <span className="font-medium text-text">
                        {profile.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="mt-8 w-full" onClick={handleEditClick}>
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Right Column: Order Stats */}
            <div className="flex flex-1 flex-col gap-6">
              <h3 className="text-xl font-bold text-text">Order Statistics</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center rounded-xl border border-muted/20 bg-surface p-6 shadow-sm text-center"
                  >
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/10 ${stat.color}`}
                    >
                      <Icon name={stat.icon as IconName} size={24} />
                    </div>
                    <span className="text-2xl font-bold text-text">{stat.value}</span>
                    <span className="text-xs text-muted uppercase tracking-wider mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-error">Failed to load profile.</div>
        )}

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => !isSaving && setIsEditModalOpen(false)}
          title="Edit Profile"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSaving}>
                Save Changes
              </Button>
            </>
          }
        >
          {errors.root && (
            <div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error border border-error/20">
              {errors.root.message}
            </div>
          )}
          <form
            id="edit-profile-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 py-4"
          >
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}
