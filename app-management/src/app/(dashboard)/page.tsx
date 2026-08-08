'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Icon, IconName } from '@/components/atoms/Icon';
import { Skeleton } from '@/components/molecules/Skeleton';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { apiClient } from '@/lib/api';

interface SummaryData {
  totalUsers?: number;
  users?: number;
  totalCategories?: number;
  categories?: number;
  totalProducts?: number;
  products?: number;
  totalOrders?: number;
  orders?: number;
}

interface OrderData {
  id: string;
  customerName?: string;
  totalAmount?: number;
  status: string;
  createdAt: string;
}

interface UserData {
  id: string;
  fullName?: string;
  email: string;
  role: string;
  isActive?: boolean;
}

const getOrderStatusBadge = (status: string) => {
  switch ((status || '').toUpperCase()) {
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
      return <Badge label={status || 'Unknown'} variant="neutral" />;
  }
};

const orderColumns: DataTableColumn<OrderData>[] = [
  { key: 'id', header: 'Order ID' },
  { key: 'customer', header: 'Customer', render: (row) => row.customerName || 'Guest' },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => `$${Number(row.totalAmount || 0).toFixed(2)}`,
  },
  { key: 'status', header: 'Status', render: (row) => getOrderStatusBadge(row.status) },
  { key: 'date', header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
];

const getUserRoleBadge = (role: string) => {
  switch ((role || '').toUpperCase()) {
    case 'SUPER_ADMIN':
      return <Badge label="Super Admin" variant="error" />;
    case 'ADMIN':
      return <Badge label="Admin" variant="warning" />;
    case 'MANAGER':
      return <Badge label="Manager" variant="info" />;
    case 'CUSTOMER':
      return <Badge label="Customer" variant="neutral" />;
    default:
      return <Badge label={role || 'User'} variant="neutral" />;
  }
};

const getUserStatusBadge = (isActive: boolean | undefined) => {
  if (isActive === false) {
    return <Badge label="Inactive" variant="error" />;
  }
  return <Badge label="Active" variant="success" />;
};

const userColumns: DataTableColumn<UserData>[] = [
  { key: 'name', header: 'Name', render: (row) => row.fullName || 'Unknown' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: (row) => getUserRoleBadge(row.role) },
  { key: 'status', header: 'Status', render: (row) => getUserStatusBadge(row.isActive) },
];

export default function DashboardHomePage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);

  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSummary() {
      try {
        const res = await apiClient.get<SummaryData>('/dashboard/summary');
        if (mounted) {
          setSummary(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) {
          setIsLoadingSummary(false);
        }
      }
    }

    async function fetchOrders() {
      try {
        const res = await apiClient.get<{ data: OrderData[] }>('/orders', { limit: 5 });
        if (mounted) {
          setOrders(res.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) {
          setIsLoadingOrders(false);
        }
      }
    }

    async function fetchUsers() {
      try {
        const res = await apiClient.get<{ data: UserData[] }>('/users', { limit: 5 });
        if (mounted) {
          setUsers(res.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    fetchSummary();
    fetchOrders();
    fetchUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const summaryStats = [
    {
      label: 'Total Users',
      value: summary?.totalUsers ?? summary?.users ?? '0',
      icon: 'Users' as IconName,
    },
    {
      label: 'Total Categories',
      value: summary?.totalCategories ?? summary?.categories ?? '0',
      icon: 'Folder' as IconName,
    },
    {
      label: 'Total Products',
      value: summary?.totalProducts ?? summary?.products ?? '0',
      icon: 'Package' as IconName,
    },
    {
      label: 'Total Orders',
      value: summary?.totalOrders ?? summary?.orders ?? '0',
      icon: 'ShoppingBag' as IconName,
    },
  ];

  return (
    <div className="flex w-full max-w-7xl mx-auto flex-col gap-8 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoadingSummary
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface border border-muted/20 rounded-xl p-6 flex items-center gap-4 shadow-sm"
              >
                <Skeleton width={48} height={48} borderRadius="9999px" />
                <div className="flex flex-col gap-2">
                  <Skeleton width={80} height={16} />
                  <Skeleton width={40} height={24} />
                </div>
              </div>
            ))
          : summaryStats.map((stat, idx) => (
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
            data={orders}
            isLoading={isLoadingOrders}
            emptyProps={{ icon: 'ShoppingBag', title: 'No orders yet' }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Recent Users</h2>
          </div>
          <DataTable
            columns={userColumns}
            data={users}
            isLoading={isLoadingUsers}
            emptyProps={{ icon: 'Users', title: 'No users found' }}
          />
        </div>
      </div>
    </div>
  );
}
