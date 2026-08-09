'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useToast } from '@/components/molecules/Toast';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: { id: number; name: string };
  isActive: boolean;
}

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Customer', value: 'CUSTOMER' },
];

export default function UserManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, isLoading: isAuthLoading } = useDashboardAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Deactivate Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (selectedRole !== 'all') {
        params.role = selectedRole;
      }

      const res = await apiClient.get<{ data: User[] }>('/users', params);
      setUsers(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedRole, toast]);

  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'MANAGER') {
        router.replace('/');
        toast.error('You do not have permission to access the user management page.');
        return;
      }
      fetchUsers();
    }
  }, [currentUser, isAuthLoading, fetchUsers, router, toast]);

  const handleAddClick = () => {
    router.push('/users/new');
  };

  const handleViewClick = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDeactivateClick = (user: User) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      toast.error('You do not have permission to deactivate users.');
      return;
    }
    if (user.id === currentUser?.id) {
      toast.error('You cannot deactivate your own account.');
      return;
    }
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) {
      return;
    }
    try {
      const newStatus = !userToDeactivate.isActive;
      await apiClient.patch(`/users/${userToDeactivate.id}/status`, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      setIsDeactivateModalOpen(false);
      setUserToDeactivate(null);
      fetchUsers();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar alt={row.fullName} size="sm" name={row.fullName} />
          <span className="font-medium text-text">{row.fullName}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <Badge
          label={row.role?.name || 'N/A'}
          variant={
            row.role?.name === 'ADMIN' ? 'error' : row.role?.name === 'MANAGER' ? 'info' : 'neutral'
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Badge
          label={row.isActive ? 'ACTIVE' : 'INACTIVE'}
          variant={row.isActive ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setDebouncedSearch}
              placeholder="Search by Name or Email..."
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full justify-between sm:w-auto">
                {roleOptions.find((o) => o.value === selectedRole)?.label}
              </Button>
            }
            options={roleOptions}
            value={selectedRole}
            onChange={(val) => setSelectedRole(val as string)}
          />
        </div>
        {currentUser?.role === 'SUPER_ADMIN' && (
          <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
            Add User
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyProps={{
          icon: 'Users',
          title: 'No users found',
          description: 'Try adjusting your search or filter to find what you are looking for.',
        }}
        rowActions={(row) => {
          const isSelf = row.id === currentUser?.id;
          const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                leftIcon="Eye"
                onClick={() => handleViewClick(row)}
                aria-label="View user"
              />
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={row.isActive ? 'Minus' : 'CheckCircle'}
                  className={
                    row.isActive
                      ? 'text-error hover:bg-error/10 hover:text-error'
                      : 'text-success hover:bg-success/10 hover:text-success'
                  }
                  onClick={() => handleDeactivateClick(row)}
                  aria-label={row.isActive ? 'Deactivate user' : 'Activate user'}
                  disabled={isSelf}
                />
              )}
            </>
          );
        }}
      />

      {/* Deactivate/Activate Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeactivateModalOpen}
        title={userToDeactivate?.isActive ? 'Deactivate User' : 'Activate User'}
        description={
          <span>
            Are you sure you want to {userToDeactivate?.isActive ? 'deactivate' : 'activate'}{' '}
            <strong>{userToDeactivate?.fullName}</strong>?{' '}
            {userToDeactivate?.isActive
              ? 'They will no longer be able to log in to the dashboard.'
              : 'They will be able to log in to the dashboard again.'}
          </span>
        }
        onConfirm={handleConfirmDeactivate}
        onCancel={() => {
          setIsDeactivateModalOpen(false);
          setUserToDeactivate(null);
        }}
      />
    </div>
  );
}
