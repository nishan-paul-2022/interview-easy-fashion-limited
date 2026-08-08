'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Skeleton } from '@/components/molecules/Skeleton';
import { Timeline, TimelineStep } from '@/components/molecules/Timeline';
import { useToast } from '@/components/molecules/Toast';
import { apiClient } from '@/lib/api';

interface OrderDetails {
  id: string;
  customerName: string;
  phone: string;
  shippingAddress: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
  };
  orderItems: {
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      name: string;
      images: { url: string }[];
    };
  }[];
}

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
  const toast = useToast();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await apiClient.get<OrderDetails>(`/orders/${orderId}`);
        setOrder(res);
        setSelectedStatus(res.status);
      } catch {
        toast.error('Failed to load order details');
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router, toast]);

  const handleSaveStatus = async () => {
    if (!order || selectedStatus === order.status) {
      return;
    }

    setIsUpdating(true);
    try {
      await apiClient.patch(`/orders/${order.id}/status`, { status: selectedStatus });
      toast.success('Order status updated successfully');
      setOrder({
        ...order,
        status: selectedStatus as OrderDetails['status'],
        updatedAt: new Date().toISOString(),
      });
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to update order status');
      setSelectedStatus(order.status); // reset to current
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
        <Skeleton height={40} width={200} />
        <Skeleton height={300} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // Build timeline based on status
  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIdx = statuses.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const timelineSteps: TimelineStep[] = statuses.map((s, idx) => {
    let title = s.charAt(0) + s.slice(1).toLowerCase();
    if (s === 'PENDING') {
      title = 'Order Placed';
    }

    let timestamp = '';
    let isCompleted = false;

    if (isCancelled) {
      if (idx === 0) {
        timestamp = new Date(order.createdAt).toLocaleString();
        isCompleted = true;
      }
    } else {
      if (idx <= currentIdx) {
        isCompleted = true;
        timestamp =
          idx === currentIdx
            ? new Date(order.updatedAt).toLocaleString()
            : new Date(order.createdAt).toLocaleString();
      }
    }

    return { title, timestamp, isCompleted };
  });

  if (isCancelled) {
    timelineSteps.push({
      title: 'Cancelled',
      timestamp: new Date(order.updatedAt).toLocaleString(),
      isCompleted: true,
    });
  }

  const subtotal = order.orderItems.reduce((acc, item) => acc + Number(item.subtotal), 0);
  const shipping = 0; // assuming free shipping

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Order Details</h1>
          <p className="text-sm text-muted">Order #{order.id}</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/orders')} leftIcon="ChevronLeft">
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
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md border border-muted/20">
                      <img
                        src={
                          item.product.images?.[0]?.url ||
                          'https://via.placeholder.com/80?text=Product'
                        }
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-text">{item.product.name}</span>
                      <span className="text-sm text-muted">
                        ${Number(item.unitPrice).toFixed(2)} x {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-text">
                    ${Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 flex flex-col gap-2 border-t border-muted/20 pt-4 text-sm">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base font-bold text-text">
                <span>Grand Total</span>
                <span className="text-accent">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info Block */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text">Customer Details</h3>
              <p className="mt-2 text-sm text-muted">
                <strong className="font-medium text-text">{order.customerName}</strong>
              </p>
              <p className="text-sm text-muted">{order.user?.email || 'Guest User'}</p>
              <p className="text-sm text-muted">{order.phone}</p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-text">Shipping Address</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {order.shippingAddress}
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
              <Button
                variant="primary"
                onClick={handleSaveStatus}
                className="w-full"
                disabled={selectedStatus === order.status || isUpdating}
                isLoading={isUpdating}
              >
                Save Status
              </Button>
            </div>
          </div>

          {/* Delivery Timeline Block */}
          <div className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Delivery Timeline</h2>
            <Timeline steps={timelineSteps} />
          </div>
        </div>
      </div>
    </div>
  );
}
