'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Icon, IconName } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Modal } from '@/components/molecules/Modal';
import { useToast } from '@/components/molecules/Toast';

// Mock Data
const INITIAL_PROFILE = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '(555) 123-4567',
  address: '123 Main St, Apt 4B\nNew York, NY 10001',
  joinDate: 'Joined March 2023',
};

const STATS = [
  { label: 'Total Orders', value: '24', icon: 'ShoppingBag', color: 'text-accent' },
  { label: 'Pending', value: '2', icon: 'Package', color: 'text-warning' },
  { label: 'Delivered', value: '21', icon: 'CheckCircle', color: 'text-success' },
  { label: 'Cancelled', value: '1', icon: 'X', color: 'text-error' },
] as const;

// Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be valid'),
  address: z.string().min(10, 'Address is too short'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
    },
  });

  const handleEditClick = () => {
    reset({
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProfile({ ...profile, ...data });
    setIsSaving(false);
    setIsEditModalOpen(false);
    toast.success('Your profile information has been saved successfully.');
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-3xl font-bold text-text">My Profile</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Column: Profile Card */}
        <div className="w-full md:w-1/3">
          <div className="flex flex-col items-center rounded-xl border border-muted/20 bg-surface p-8 shadow-sm text-center">
            <div className="relative mb-4">
              <Avatar name={profile.name} size="lg" className="h-24 w-24 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-text">{profile.name}</h2>
            <p className="mb-6 text-sm text-muted">{profile.joinDate}</p>

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/10">
                  <Icon name="Search" size={16} className="text-muted" />{' '}
                  {/* Fallback icon, ideally Mail */}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Email</span>
                  <span className="font-medium text-text">{profile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/10">
                  <Icon name="CheckCircle" size={16} className="text-muted" />{' '}
                  {/* Fallback icon, ideally Phone */}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Phone</span>
                  <span className="font-medium text-text">{profile.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/10">
                  <Icon name="Search" size={16} className="text-muted" />{' '}
                  {/* Fallback icon, ideally MapPin */}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">Address</span>
                  <span className="whitespace-pre-line font-medium text-text">
                    {profile.address}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="mt-8 w-full" onClick={handleEditClick}>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Right Column: Order Stats & Recent Activity */}
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
        <form
          id="edit-profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-4"
        >
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Textarea
            label="Shipping Address"
            placeholder="123 Main St..."
            rows={4}
            error={errors.address?.message}
            {...register('address')}
          />
        </form>
      </Modal>
    </div>
  );
}
