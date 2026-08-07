'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderData {
  id: string;
  date: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedOrder = sessionStorage.getItem('easyfashion_order_success');
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch {
        router.push('/cart');
      }
    } else {
      router.push('/cart');
    }
  }, [router]);

  if (!mounted || !order) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    alert('Downloading invoice for order ' + order.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16">
      {/* Success Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="CheckCircle" size={48} />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-text">Order Placed Successfully!</h1>
        <p className="mb-4 text-muted">
          Thank you for your purchase. Your order has been received.
        </p>
        <div className="rounded-lg bg-surface px-6 py-3 border border-muted/20">
          <span className="text-sm text-muted">Order ID: </span>
          <span className="font-bold text-accent">{order.id}</span>
        </div>
      </div>

      <div className="w-full flex-col gap-8 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8">
        {/* Order Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-text">Shipping Address</h3>
            <p className="whitespace-pre-line text-sm text-muted">{order.address}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-text">Order Date</h3>
            <p className="text-sm text-muted">{order.date}</p>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-muted/20" />

        {/* Ordered Items Summary */}
        <h3 className="mb-4 font-semibold text-text">Order Summary</h3>
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/10">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-semibold text-text line-clamp-1">{item.name}</span>
                <span className="text-sm text-muted">
                  Size: {item.size} &bull; Qty: {item.quantity}
                </span>
                <span className="mt-auto font-medium text-text">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-6 h-px w-full bg-muted/20" />

        {/* Totals */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium text-text">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-medium text-text">
              {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="font-medium text-text">${order.tax.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-muted/20 pt-4 text-lg font-bold">
            <span className="text-text">Grand Total</span>
            <span className="text-text">${order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/products" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={handleDownloadInvoice}
          className="w-full sm:w-auto"
        >
          Download Invoice
        </Button>
      </div>
    </div>
  );
}
