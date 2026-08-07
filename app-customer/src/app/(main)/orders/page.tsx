'use client';

import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { AuthGuard } from '@/components/molecules/AuthGuard';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { apiClient } from '@/lib/api';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

interface PaginatedOrders {
  data: Order[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
    case 'PROCESSING':
      return 'warning';
    case 'SHIPPED':
      return 'info';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'neutral';
  }
};

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchOrders() {
      try {
        const res = await apiClient.get<PaginatedOrders>('/orders/me', { limit: 50 });
        if (mounted) {
          setOrders(res.data || []);
        }
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => <span className="font-medium text-text">{row.id}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => (
        <span className="text-muted">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (row) => <span className="text-muted">{row.items?.length || 0} items</span>,
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (row) => (
        <span className="font-medium text-text">${Number(row.totalAmount || 0).toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status || '')} label={row.status || 'UNKNOWN'} />
      ),
    },
  ];

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
        <h1 className="text-3xl font-bold text-text">My Orders</h1>

        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading}
          emptyProps={{
            title: 'No orders yet',
            description: "You haven't placed any orders with us yet.",
            icon: 'Package',
            action: {
              label: 'Start Shopping',
              onClick: () => (window.location.href = '/products'),
            },
          }}
        />
      </div>
    </AuthGuard>
  );
}
