'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Skeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { ProductForm, ProductFormData } from '@/components/organisms/ProductForm';
import { apiClient } from '@/lib/api';

interface ProductDetails {
  id: string;
  name: string;
  categoryId?: string;
  category?: { id: string; name: string };
  styleId?: string;
  style?: { id: string; name: string };
  sizes?: { id: string; name: string }[];
  price: number;
  status: string;
  isActive?: boolean;
  description: string;
  images: string[];
}

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const productId = params.id as string;

  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await apiClient.get<ProductDetails>(`/products/${productId}`);
        // Map the backend product response to ProductFormData
        const data: ProductFormData = {
          id: res.id,
          name: res.name,
          categoryId: String(res.categoryId || res.category?.id || ''),
          styleId: String(res.styleId || res.style?.id || ''),
          sizeIds: (res.sizes || []).map((s) => String(s.id)),
          description: res.description || '',
          price: String(res.price || ''),
          isActive: res.status !== 'INACTIVE', // or res.isActive if that's what backend returns
          images: res.images || [],
        };
        // wait, backend has isActive property?
        // According to our create-product DTO it's isActive: boolean
        if (typeof res.isActive === 'boolean') {
          data.isActive = res.isActive;
        }

        setInitialData(data);
      } catch {
        toast.error('Failed to load product for editing');
        router.push('/products');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, router, toast]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text">Edit Product</h1>
        <p className="text-sm text-muted">Update the details of this product.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton height={200} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      ) : initialData ? (
        <ProductForm initialData={initialData} isEdit={true} />
      ) : null}
    </div>
  );
}
