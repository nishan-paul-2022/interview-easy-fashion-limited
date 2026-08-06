'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

interface Order {
  id: string;
  date: string;
  itemsCount: number;
  amount: number;
  status: OrderStatus;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-8F92-4C1A',
    date: '2023-10-15',
    itemsCount: 3,
    amount: 120.93,
    status: 'Processing',
  },
  {
    id: 'ORD-3B21-9E4D',
    date: '2023-09-22',
    itemsCount: 1,
    amount: 45.0,
    status: 'Delivered',
  },
  {
    id: 'ORD-1A77-5D9F',
    date: '2023-08-05',
    itemsCount: 2,
    amount: 89.99,
    status: 'Shipped',
  },
  {
    id: 'ORD-9F44-2C1E',
    date: '2023-07-11',
    itemsCount: 5,
    amount: 215.5,
    status: 'Delivered',
  },
  {
    id: 'ORD-5E22-8A4C',
    date: '2023-06-30',
    itemsCount: 1,
    amount: 29.99,
    status: 'Cancelled',
  },
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Processing':
      return 'warning';
    case 'Shipped':
      return 'info';
    case 'Delivered':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'neutral';
  }
};

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Mock API loading delay
    const timer = setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => <span className="font-medium text-text">{row.id}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-muted">{row.date}</span>,
    },
    {
      key: 'itemsCount',
      header: 'Items',
      render: (row) => <span className="text-muted">{row.itemsCount} items</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-medium text-text">${row.amount.toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge variant={getStatusBadgeVariant(row.status)} label={row.status} />,
    },
  ];

  return (
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
        rowActions={() => (
          <Link href="#" className="text-sm font-medium text-accent hover:underline">
            View Details
          </Link>
        )}
      />
    </div>
  );
}
