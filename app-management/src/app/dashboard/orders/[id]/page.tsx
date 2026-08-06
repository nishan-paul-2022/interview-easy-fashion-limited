'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Timeline, TimelineStep } from '@/components/molecules/Timeline';

const mockOrder = {
  id: 'ORD-001',
  customer: {
    name: 'Alice Smith',
    phone: '+1 234 567 8900',
    email: 'alice@example.com',
    address: '123 Fashion Ave, Suite 400\nNew York, NY 10001\nUnited States',
  },
  items: [
    {
      id: '1',
      name: 'Classic White T-Shirt',
      quantity: 2,
      unitPrice: 25.99,
      total: 51.98,
      thumbnail: 'https://via.placeholder.com/80?text=T-Shirt',
    },
    {
      id: '2',
      name: 'Vintage Blue Jeans',
      quantity: 1,
      unitPrice: 68.02,
      total: 68.02,
      thumbnail: 'https://via.placeholder.com/80?text=Jeans',
    },
  ],
  subtotal: 120.0,
  shipping: 0.0,
  grandTotal: 120.0,
  status: 'PROCESSING',
  timeline: [
    { title: 'Order Placed', timestamp: '2026-08-01 10:00 AM', isCompleted: true },
    { title: 'Payment Confirmed', timestamp: '2026-08-01 10:05 AM', isCompleted: true },
    { title: 'Processing', timestamp: '2026-08-02 09:00 AM', isCompleted: true },
    { title: 'Shipped', timestamp: '', isCompleted: false },
    { title: 'Delivered', timestamp: '', isCompleted: false },
  ] as TimelineStep[],
};

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const order = { ...mockOrder, id: orderId ? `ORD-${orderId}` : mockOrder.id };

  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleSaveStatus = () => {
    console.log('Saving order status:', selectedStatus);
    // In a real app, this would mutate the order status and show a toast.
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Order Details</h1>
          <p className="text-sm text-muted">Order #{order.id}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/orders')}
          leftIcon="ChevronLeft"
        >
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Items & Customer Info */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* Ordered Items List */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Ordered Items</h2>
            <div className="flex flex-col gap-4 divide-y divide-muted/10">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md border border-muted/20">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-text">{item.name}</span>
                      <span className="text-sm text-muted">
                        ${item.unitPrice.toFixed(2)} x {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-text">${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 flex flex-col gap-2 border-t border-muted/20 pt-4 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base font-bold text-text">
                <span>Grand Total</span>
                <span className="text-accent">${order.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info Block */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text">Customer Details</h3>
              <p className="mt-2 text-sm text-muted">
                <strong className="font-medium text-text">{order.customer.name}</strong>
              </p>
              <p className="text-sm text-muted">{order.customer.email}</p>
              <p className="text-sm text-muted">{order.customer.phone}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text">Shipping Address</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {order.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Status Update */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Status Update Block */}
          <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Update Status</h2>
            <div className="flex flex-col gap-3">
              <Dropdown
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {statusOptions.find((o) => o.value === selectedStatus)?.label}
                  </Button>
                }
                options={statusOptions}
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val as string)}
              />
              <Button variant="primary" onClick={handleSaveStatus} className="w-full">
                Save Status
              </Button>
            </div>
          </div>

          {/* Delivery Timeline Block */}
          <div className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Delivery Timeline</h2>
            <Timeline steps={order.timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
