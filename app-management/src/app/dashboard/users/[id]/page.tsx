'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  createdDate: string;
  lastLogin: string;
}

const mockUser: UserDetail = {
  id: 'USR-001',
  name: 'Alice Smith',
  email: 'alice@example.com',
  phone: '+1 234 567 8900',
  role: 'ADMIN',
  status: 'ACTIVE',
  avatarUrl: 'https://i.pravatar.cc/150?u=alice',
  createdDate: '2026-01-15T10:00:00Z',
  lastLogin: '2026-08-05T14:30:00Z',
};

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  // In a real app, you would fetch the user using userId.
  const user = { ...mockUser, id: userId ? `USR-${userId}` : mockUser.id };

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [status, setStatus] = useState(user.status);

  const handleEditClick = () => {
    router.push(`/dashboard/users/${user.id.replace('USR-', '')}/edit`);
  };

  const handleToggleStatusClick = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmToggleStatus = () => {
    const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log(`Setting user status to: ${newStatus}`);
    setStatus(newStatus);
    setIsDeactivateModalOpen(false);
  };

  const isUserActive = status === 'ACTIVE';

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">User Details</h1>
          <p className="text-sm text-muted">ID: {user.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/users')}
            leftIcon="ChevronLeft"
          >
            Back to Users
          </Button>
          <Button variant="outline" onClick={handleEditClick} leftIcon="Pencil">
            Edit User
          </Button>
          <Button
            variant={isUserActive ? 'danger' : 'primary'}
            onClick={handleToggleStatusClick}
            leftIcon={isUserActive ? 'Minus' : 'CheckCircle'}
          >
            {isUserActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Block */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-4 rounded-xl border border-muted/20 bg-surface p-8 shadow-sm md:col-span-1">
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            name={user.name}
            size="lg"
            className="h-24 w-24 text-3xl"
          />
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-text">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge
              label={user.role}
              variant={
                user.role === 'ADMIN' ? 'error' : user.role === 'MANAGER' ? 'info' : 'neutral'
              }
            />
            <Badge label={status} variant={isUserActive ? 'success' : 'neutral'} />
          </div>
        </div>

        {/* Info & Metadata */}
        <div className="col-span-1 flex flex-col gap-6 md:col-span-2">
          {/* Contact Details */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text">Contact Information</h3>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Email Address</span>
                <span className="font-semibold text-text">{user.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Phone Number</span>
                <span className="font-semibold text-text">{user.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Account Metadata */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text">Account Activity</h3>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Created Date</span>
                <span className="font-semibold text-text">
                  {new Date(user.createdDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Last Login</span>
                <span className="font-semibold text-text">
                  {new Date(user.lastLogin).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Status Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeactivateModalOpen}
        title={isUserActive ? 'Deactivate User' : 'Activate User'}
        description={
          <span>
            Are you sure you want to {isUserActive ? 'deactivate' : 'activate'}{' '}
            <strong>{user.name}</strong>?{' '}
            {isUserActive
              ? 'They will no longer be able to log in to the system.'
              : 'They will regain access to the system.'}
          </span>
        }
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setIsDeactivateModalOpen(false)}
      />
    </div>
  );
}
