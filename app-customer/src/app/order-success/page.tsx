import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules/EmptyState';

export default function OrderSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-24">
      <div className="w-full">
        <EmptyState
          icon="CheckCircle"
          title="Order Placed Successfully!"
          description="Thank you for your purchase. We've received your order and will email you a confirmation and shipping updates shortly."
        />

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row justify-center">
          <Link href="/products">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
