'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useToast } from '@/components/molecules/Toast';
import { ProductForm } from '@/components/organisms/ProductForm';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

export default function ProductCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isLoading } = useDashboardAuth();

  React.useEffect(() => {
    if (!isLoading && user && user.role === 'MANAGER') {
      router.replace('/products');
      toast.error('You do not have permission to add products.');
    }
  }, [user, isLoading, router, toast]);

  if (isLoading || (user && user.role === 'MANAGER')) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text">Create New Product</h1>
        <p className="text-sm text-muted">
          Fill in the details to add a new product to your store.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
