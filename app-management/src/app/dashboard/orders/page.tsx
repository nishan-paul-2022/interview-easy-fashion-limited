'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface Order {
  id: string;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string;
}

const mockOrders: Order[] = [
  {
    id: '#ORD-001',
    customerName: 'Alice Smith',
    itemsCount: 3,
    totalAmount: 120.0,
    status: 'DELIVERED',
    date: '2026-08-01',
  },
  {
    id: '#ORD-002',
    customerName: 'Bob Jones',
    itemsCount: 1,
    totalAmount: 85.5,
    status: 'PROCESSING',
    date: '2026-08-02',
  },
  {
    id: '#ORD-003',
    customerName: 'Charlie Brown',
    itemsCount: 5,
    totalAmount: 210.0,
    status: 'PENDING',
    date: '2026-08-03',
  },
  {
    id: '#ORD-004',
    customerName: 'Diana Prince',
    itemsCount: 2,
    totalAmount: 45.0,
    status: 'SHIPPED',
    date: '2026-08-04',
  },
  {
    id: '#ORD-005',
    customerName: 'Evan Wright',
    itemsCount: 4,
    totalAmount: 320.0,
    status: 'CANCELLED',
    date: '2026-08-05',
  },
];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, selectedStatus]);

  const handleViewClick = (order: Order) => {
    // Note: To be implemented in Prompt #54
    router.push(`/dashboard/orders/${order.id.replace('#', '')}`);
  };

  const columns: DataTableColumn<Order>[] = [
    { key: 'id', header: 'Order ID', sortable: true },
    { key: 'customerName', header: 'Customer Name', sortable: true },
    { key: 'itemsCount', header: 'Items', sortable: true },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (row) => <span>${row.totalAmount.toFixed(2)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => getOrderStatusBadge(row.status) },
    { key: 'date', header: 'Date', sortable: true },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Topbar Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-[320px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(val) => console.log('Searching orders:', val)}
              placeholder="Search by Order ID or Customer..."
            />
          </div>
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
        data={filteredOrders}
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
