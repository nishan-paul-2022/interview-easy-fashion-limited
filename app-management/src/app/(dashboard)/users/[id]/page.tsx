'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Skeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: { id: number; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string; // wait backend might not have lastLoginAt
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const userId = params.id as string;
  const { user: currentUser, isLoading: isAuthLoading } = useDashboardAuth();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiClient.get<UserDetail>(`/users/${userId}`);
        setUser(res);
      } catch {
        toast.error('Failed to load user details');
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    }
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'MANAGER') {
        router.replace('/');
        toast.error('You do not have permission to access user details.');
        return;
      }
      if (userId) {
        fetchUser();
      }
    }
  }, [userId, router, toast, currentUser, isAuthLoading]);

  const handleToggleStatusClick = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!user) {
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const newStatus = !user.isActive;
      await apiClient.patch(`/users/${user.id}/status`, { isActive: newStatus });
      setUser({ ...user, isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
      setIsDeactivateModalOpen(false);
    }
  };

  const handleChangeRole = async (newRoleName: string) => {
    if (!user) {
      return;
    }
    if (user.role.name === newRoleName) {
      return;
    }

    setIsUpdatingRole(true);
    try {
      await apiClient.patch(`/users/${user.id}/role`, { role: newRoleName });
      setUser({ ...user, role: { ...user.role, name: newRoleName } });
      toast.success('User role updated successfully');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
        <Skeleton height={40} width={200} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isUserActive = user.isActive;
  const isSelf = user.id === currentUser?.id;

  const roleOptions = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Customer', value: 'CUSTOMER' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-text">User Details</h1>
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-muted/10 border border-muted/20 text-xs font-semibold text-muted font-mono">
            ID: {user.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/users')} leftIcon="ChevronLeft">
            Back to Users
          </Button>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Button
              variant={isUserActive ? 'danger' : 'primary'}
              onClick={handleToggleStatusClick}
              leftIcon={isUserActive ? 'Minus' : 'CheckCircle'}
              disabled={isSelf || isUpdatingStatus}
              isLoading={isUpdatingStatus}
            >
              {isUserActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Block */}
        <div className="col-span-1 flex flex-col items-center justify-center gap-4 rounded-xl border border-muted/20 bg-surface p-8 shadow-sm md:col-span-1">
          <Avatar name={user.fullName} size="lg" className="h-24 w-24 text-3xl" />
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-text">{user.fullName}</h2>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <div className="mt-2 flex flex-col items-center justify-center gap-2">
            <Badge
              label={isUserActive ? 'ACTIVE' : 'INACTIVE'}
              variant={isUserActive ? 'success' : 'neutral'}
            />

            {isSelf || currentUser?.role !== 'SUPER_ADMIN' ? (
              <Badge
                label={user.role?.name}
                variant={
                  user.role?.name === 'ADMIN'
                    ? 'error'
                    : user.role?.name === 'MANAGER'
                      ? 'info'
                      : 'neutral'
                }
              />
            ) : (
              <Dropdown
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-32 justify-between"
                    isLoading={isUpdatingRole}
                  >
                    {user.role?.name}
                  </Button>
                }
                options={roleOptions}
                value={user.role?.name}
                onChange={(val) => handleChangeRole(val as string)}
              />
            )}
          </div>
        </div>

        {/* Info & Metadata */}
        <div className="col-span-1 flex flex-col gap-6 md:col-span-2">
          {/* Contact Details */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text">Contact Information</h3>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium text-muted">Email Address</span>
                <span className="font-semibold text-text break-all">{user.email}</span>
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
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Last Updated</span>
                <span className="font-semibold text-text">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
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
            <strong>{user.fullName}</strong>?{' '}
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
