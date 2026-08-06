'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { state, dispatch, subtotal } = useCart();
  const router = useRouter();

  // Hydration fix for localStorage state rendering on client only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex w-full min-h-[50vh] items-center justify-center">
        <Icon name="Search" size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // Mock 8% tax
  const grandTotal = subtotal + shipping + tax;

  if (state.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-16">
        <EmptyState
          icon="ShoppingBag"
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={{
            label: 'Start Shopping',
            onClick: () => router.push('/products'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
      <h1 className="text-3xl font-bold text-text">Shopping Cart</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Cart Items List */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="hidden grid-cols-12 gap-4 border-b border-muted/20 pb-4 text-sm font-medium text-muted md:grid">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="flex flex-col gap-6 pt-4">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 border-b border-muted/10 pb-6 md:grid-cols-12 md:items-center"
              >
                <div className="col-span-1 flex items-center gap-4 md:col-span-6">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted/10">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-text hover:text-accent transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted">Size: {item.size}</p>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                      className="mt-1 flex w-fit items-center gap-1 text-sm text-error hover:underline"
                    >
                      <Icon name="Trash2" size={14} /> Remove
                    </button>
                  </div>
                </div>

                <div className="hidden text-center font-medium text-text md:col-span-2 md:block">
                  ${item.price.toFixed(2)}
                </div>

                <div className="col-span-1 flex items-center gap-4 md:col-span-2 md:justify-center">
                  <div className="flex h-10 w-28 items-center justify-between rounded-lg border border-muted/30 bg-surface px-3">
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_QUANTITY',
                          payload: { id: item.id, quantity: Math.max(1, item.quantity - 1) },
                        })
                      }
                      className="text-muted hover:text-text disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Icon name="Minus" size={14} />
                    </button>
                    <span className="font-semibold text-text">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_QUANTITY',
                          payload: { id: item.id, quantity: item.quantity + 1 },
                        })
                      }
                      className="text-muted hover:text-text"
                    >
                      <Icon name="Plus" size={14} />
                    </button>
                  </div>
                  <div className="font-semibold text-text md:hidden">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="hidden text-right font-semibold text-text md:col-span-2 md:block">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="flex flex-col gap-6 rounded-xl border border-muted/20 bg-surface p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-text">Order Summary</h2>

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
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => {
                // Mock checkout action
                alert('Proceeding to checkout...');
              }}
            >
              Proceed to Checkout
            </Button>

            <p className="text-xs text-center text-muted">
              Secure checkout. Free shipping on orders over $50.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
