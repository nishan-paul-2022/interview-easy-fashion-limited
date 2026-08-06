'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
}

const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
  },
  {
    id: 'USR-002',
    name: 'Bob Jones',
    email: 'bob@example.com',
    role: 'MANAGER',
    status: 'ACTIVE',
  },
  {
    id: 'USR-003',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'CUSTOMER',
    status: 'INACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=charlie',
  },
  {
    id: 'USR-004',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  },
  {
    id: 'USR-005',
    name: 'Evan Wright',
    email: 'evan@example.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=evan',
  },
];

const roleOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Customer', value: 'CUSTOMER' },
];

export default function UserManagementPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Deactivate Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, selectedRole]);

  const handleAddClick = () => {
    router.push('/dashboard/users/new');
  };

  const handleViewClick = (user: User) => {
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleEditClick = (user: User) => {
    router.push(`/dashboard/users/${user.id}/edit`);
  };

  const handleDeactivateClick = (user: User) => {
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    console.log('Deactivating user:', userToDeactivate?.name);
    setIsDeactivateModalOpen(false);
    setUserToDeactivate(null);
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} alt={row.name} size="sm" name={row.name} />
          <span className="font-medium text-text">{row.name}</span>
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
          label={row.role}
          variant={row.role === 'ADMIN' ? 'error' : row.role === 'MANAGER' ? 'info' : 'neutral'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Badge label={row.status} variant={row.status === 'ACTIVE' ? 'success' : 'neutral'} />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Header and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(val) => console.log('Searching users:', val)}
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
        <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
          Add User
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyProps={{
          icon: 'Users',
          title: 'No users found',
          description: 'Try adjusting your search or filter to find what you are looking for.',
        }}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Eye"
              onClick={() => handleViewClick(row)}
              aria-label="View user"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Pencil"
              onClick={() => handleEditClick(row)}
              aria-label="Edit user"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Minus"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={() => handleDeactivateClick(row)}
              aria-label="Deactivate user"
            />
          </>
        )}
      />

      {/* Deactivate Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeactivateModalOpen}
        title="Deactivate User"
        description={
          <span>
            Are you sure you want to deactivate <strong>{userToDeactivate?.name}</strong>? They will
            no longer be able to log in.
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
