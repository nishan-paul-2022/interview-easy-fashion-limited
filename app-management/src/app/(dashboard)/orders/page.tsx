'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Dropdown } from '@/components/molecules/Dropdown';
import { useToast } from '@/components/molecules/Toast';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { apiClient } from '@/lib/api';

interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  orderItems?: { quantity: number }[];
}

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const getOrderStatusBadge = (status: Order['status']) => {
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

export default function OrderListPage() {
  const router = useRouter();
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const res = await apiClient.get<{ data: Order[] }>('/orders', params);
      setOrders(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewClick = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const columns: DataTableColumn<Order>[] = [
    { key: 'id', header: 'Order ID', sortable: true, render: (row) => row.id.split('-')[0] },
    { key: 'customerName', header: 'Customer Name', sortable: true },
    {
      key: 'itemsCount',
      header: 'Items',
      render: (row) => (
        <span>{row.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (row) => <span>${Number(row.totalAmount).toFixed(2)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => getOrderStatusBadge(row.status) },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (row) => <span>{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Topbar Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full justify-between sm:w-auto">
                {statusOptions.find((o) => o.value === selectedStatus)?.label}
              </Button>
            }
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val as string)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyProps={{
          icon: 'ShoppingBag',
          title: 'No orders yet',
          description: 'When customers place orders, they will appear here.',
        }}
        rowActions={(row) => (
          <Button
            variant="ghost"
            size="sm"
            leftIcon="Eye"
            onClick={() => handleViewClick(row)}
            aria-label="View order"
          />
        )}
      />
    </div>
  );
}
