'use client';

import React from 'react';
import { ProductForm } from '@/components/organisms/ProductForm';

export default function ProductCreatePage() {
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
