'use client';

import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Icon, IconName } from '@/components/atoms/Icon';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface SummaryStat {
  label: string;
  value: string;
  icon: IconName;
}

const summaryStats: SummaryStat[] = [
  { label: 'Total Users', value: '1,248', icon: 'Users' },
  { label: 'Total Categories', value: '12', icon: 'Folder' },
  { label: 'Total Products', value: '346', icon: 'Package' },
  { label: 'Total Orders', value: '2,845', icon: 'ShoppingBag' },
];

interface MockOrder {
  id: string;
  customer: string;
  amount: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string;
}

const mockOrders: MockOrder[] = [
  {
    id: '#ORD-001',
    customer: 'Alice Smith',
    amount: '$120.00',
    status: 'DELIVERED',
    date: '2026-08-01',
  },
  {
    id: '#ORD-002',
    customer: 'Bob Jones',
    amount: '$85.50',
    status: 'PROCESSING',
    date: '2026-08-02',
  },
  {
    id: '#ORD-003',
    customer: 'Charlie Brown',
    amount: '$210.00',
    status: 'PENDING',
    date: '2026-08-03',
  },
  {
    id: '#ORD-004',
    customer: 'Diana Prince',
    amount: '$45.00',
    status: 'SHIPPED',
    date: '2026-08-04',
  },
  {
    id: '#ORD-005',
    customer: 'Evan Wright',
    amount: '$320.00',
    status: 'CANCELLED',
    date: '2026-08-05',
  },
];

const getOrderStatusBadge = (status: MockOrder['status']) => {
  switch (status) {
    case 'DELIVERED':
      return <Badge label="Delivered" variant="success" />;
    case 'PROCESSING':
      return <Badge label="Processing" variant="info" />;
    case 'PENDING':
      return <Badge label="Pending" variant="warning" />;
    case 'SHIPPED':
      return <Badge label="Shipped" variant="info" />;
    case 'CANCELLED':
      return <Badge label="Cancelled" variant="error" />;
    default:
      return <Badge label={status} variant="neutral" />;
  }
};

const orderColumns: DataTableColumn<MockOrder>[] = [
  { key: 'id', header: 'Order ID' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount' },
  { key: 'status', header: 'Status', render: (row) => getOrderStatusBadge(row.status) },
  { key: 'date', header: 'Date' },
];

interface MockUser {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
}

const mockUsers: MockUser[] = [
  {
    name: 'Admin User',
    email: 'admin@easy-fashion.com',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  },
  {
    name: 'John Manager',
    email: 'john@easy-fashion.com',
    role: 'MANAGER',
    status: 'ACTIVE',
  },
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  },
  {
    name: 'Bob Jones',
    email: 'bob@example.com',
    role: 'CUSTOMER',
    status: 'INACTIVE',
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  },
];

const getUserRoleBadge = (role: MockUser['role']) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge label="Super Admin" variant="error" />;
    case 'ADMIN':
      return <Badge label="Admin" variant="warning" />;
    case 'MANAGER':
      return <Badge label="Manager" variant="info" />;
    case 'CUSTOMER':
      return <Badge label="Customer" variant="neutral" />;
    default:
      return <Badge label={role} variant="neutral" />;
  }
};

const getUserStatusBadge = (status: MockUser['status']) => {
  if (status === 'ACTIVE') {
    return <Badge label="Active" variant="success" />;
  }
  return <Badge label="Inactive" variant="error" />;
};

const userColumns: DataTableColumn<MockUser>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: (row) => getUserRoleBadge(row.role) },
  { key: 'status', header: 'Status', render: (row) => getUserStatusBadge(row.status) },
];

export default function DashboardHomePage() {
  return (
    <div className="flex w-full max-w-7xl mx-auto flex-col gap-8 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-surface border border-muted/20 rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Latest Orders</h2>
          </div>
          <DataTable
            columns={orderColumns}
            data={mockOrders}
            emptyProps={{ icon: 'ShoppingBag', title: 'No orders yet' }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Recent Users</h2>
          </div>
          <DataTable
            columns={userColumns}
            data={mockUsers}
            emptyProps={{ icon: 'Users', title: 'No users found' }}
          />
        </div>
      </div>
    </div>
  );
}
