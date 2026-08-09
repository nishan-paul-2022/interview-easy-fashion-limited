'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/api';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be valid'),
  address: z.string().min(10, 'Please enter your full shipping address'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { state, subtotal, dispatch } = useCart();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessful, setOrderSuccessful] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (state.items.length === 0 && !orderSuccessful) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-16">
        <EmptyState
          icon="ShoppingBag"
          title="Your cart is empty"
          description="You need to add items to your cart before proceeding to checkout."
          action={{
            label: 'Go back to Cart',
            onClick: () => router.push('/cart'),
          }}
        />
      </div>
    );
  }

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        customerName: data.fullName,
        phone: data.phone,
        shippingAddress: data.address,
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      interface OrderResponse {
        id?: string;
        [key: string]: unknown;
      }

      const res = await apiClient.post<OrderResponse>('/orders', payload);

      const orderData = {
        id: res.id || 'ORD-' + Math.random().toString(36).substring(7).toUpperCase(),
        date: new Date().toLocaleDateString(),
        address: data.address,
        items: state.items,
        subtotal,
        shipping,
        tax,
        grandTotal,
      };

      sessionStorage.setItem('easyfashion_order_success', JSON.stringify(orderData));

      setOrderSuccessful(true);
      dispatch({ type: 'CLEAR_CART' });
      router.push('/order-success');
    } catch (error: unknown) {
      const err = error as { message?: string | string[] };
      if (err.message && Array.isArray(err.message)) {
        err.message.forEach((msg: string) => {
          if (typeof msg === 'string') {
            const m = msg.toLowerCase();
            if (m.includes('name')) {
              setError('fullName', { type: 'server', message: msg });
            } else if (m.includes('phone')) {
              setError('phone', { type: 'server', message: msg });
            } else if (m.includes('address')) {
              setError('address', { type: 'server', message: msg });
            } else {
              setError('root', { type: 'server', message: msg });
            }
          }
        });
      } else {
        setError('root', {
          type: 'server',
          message: (err.message as string) || 'Failed to create order',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/cart" className="transition-colors hover:text-accent">
          Cart
        </Link>
        <Icon name="ChevronRight" size={16} />
        <span className="font-medium text-text">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-text">Checkout</h1>

      {errors.root && (
        <div className="rounded-lg bg-error/10 p-4 text-error border border-error/20">
          {errors.root.message}
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Column: Form */}
        <div className="flex-1">
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm">
              <h2 className="text-xl font-bold text-text mb-2">Shipping Information</h2>

              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="(555) 123-4567"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Textarea
                label="Shipping Address"
                placeholder="123 Main St, Apt 4B&#10;City, State, 12345"
                rows={4}
                error={errors.address?.message}
                {...register('address')}
              />
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full flex-shrink-0 lg:w-96 xl:max-w-md">
          <div className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-text">Order Summary</h2>

            {/* Read-only Line Items */}
            <div className="flex max-h-60 flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/10">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold text-text line-clamp-1">{item.name}</span>
                    <span className="text-sm text-muted">
                      Size: {item.size} &bull; Quantity: {item.quantity}
                    </span>
                    <span className="mt-auto font-medium text-text">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-muted/20" />

            {/* Totals */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-text">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium text-text">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Estimated Tax</span>
                <span className="font-medium text-text">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-px w-full bg-muted/20" />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-text">Total</span>
              <span className="text-text">${grandTotal.toFixed(2)}</span>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              isLoading={isSubmitting}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
