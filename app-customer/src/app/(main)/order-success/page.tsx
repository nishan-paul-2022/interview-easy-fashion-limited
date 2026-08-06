'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

const MOCK_ORDER = {
  id: 'ORD-8F92-4C1A',
  date: new Date().toLocaleDateString(),
  address: '123 Main St, Apt 4B\nNew York, NY 10001',
  items: [
    {
      id: 'prd_0',
      name: 'Premium Product 1',
      size: 'M',
      quantity: 1,
      price: 29.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prd_2',
      name: 'Premium Product 3',
      size: 'L',
      quantity: 2,
      price: 40.99,
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
    },
  ],
  subtotal: 111.97,
  shipping: 0,
  tax: 8.96,
  grandTotal: 120.93,
};

export default function OrderSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    // Mock downloading invoice
    alert('Downloading invoice for order ' + MOCK_ORDER.id);
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
          <span className="font-bold text-accent">{MOCK_ORDER.id}</span>
        </div>
      </div>

      <div className="w-full flex-col gap-8 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sm:p-8">
        {/* Order Details Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-text">Shipping Address</h3>
            <p className="whitespace-pre-line text-sm text-muted">{MOCK_ORDER.address}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-text">Order Date</h3>
            <p className="text-sm text-muted">{MOCK_ORDER.date}</p>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-muted/20" />

        {/* Ordered Items Summary */}
        <h3 className="mb-4 font-semibold text-text">Order Summary</h3>
        <div className="flex flex-col gap-4">
          {MOCK_ORDER.items.map((item) => (
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
            <span className="font-medium text-text">${MOCK_ORDER.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-medium text-text">
              {MOCK_ORDER.shipping === 0 ? 'Free' : `$${MOCK_ORDER.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="font-medium text-text">${MOCK_ORDER.tax.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-muted/20 pt-4 text-lg font-bold">
            <span className="text-text">Grand Total</span>
            <span className="text-text">${MOCK_ORDER.grandTotal.toFixed(2)}</span>
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
