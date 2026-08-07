'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { ImageGallery } from '@/components/molecules/ImageGallery';
import { Skeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { apiClient } from '@/lib/api';

const getStatusBadge = (status: string) => {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE':
      return <Badge label="Active" variant="success" />;
    case 'DRAFT':
      return <Badge label="Draft" variant="warning" />;
    case 'OUT_OF_STOCK':
      return <Badge label="Out of Stock" variant="error" />;
    case 'INACTIVE':
      return <Badge label="Inactive" variant="neutral" />;
    default:
      return <Badge label={status || 'Unknown'} variant="neutral" />;
  }
};

interface ProductDetails {
  id: string;
  name: string;
  category?: { id: string; name: string };
  style?: { id: string; name: string };
  sizes?: { id: string; name: string }[];
  price: number;
  status: string;
  isActive?: boolean;
  description: string;
  images: string[];
}

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await apiClient.get<ProductDetails>(`/products/${productId}`);
        setProduct(res);
      } catch {
        toast.error('Failed to load product details');
        router.push('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId, router, toast]);

  const handleEditClick = () => {
    if (product) {
      router.push(`/dashboard/products/${product.id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!product) {
      return;
    }
    try {
      await apiClient.delete(`/products/${product.id}`);
      toast.success(`Product "${product.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      router.push('/dashboard/products');
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
        <Skeleton height={50} width={300} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-12">
      {/* Header with actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Product Details</h1>
          <p className="text-sm text-muted">ID: {product.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/products')}
            leftIcon="ChevronLeft"
          >
            Back to List
          </Button>
          <Button variant="outline" onClick={handleEditClick} leftIcon="Pencil">
            Edit Product
          </Button>
          <Button variant="danger" onClick={handleDeleteClick} leftIcon="Trash2">
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Col: Image Gallery */}
        <div className="w-full">
          <ImageGallery
            images={
              product.images?.length
                ? product.images
                : [
                    'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=600',
                  ]
            }
          />
        </div>

        {/* Right Col: Metadata */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-text">{product.name}</h2>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-accent">
                ${Number(product.price).toFixed(2)}
              </span>
              {getStatusBadge(product.isActive === false ? 'INACTIVE' : product.status)}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-y-4 rounded-xl border border-muted/20 bg-surface p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Category</span>
                <span className="font-semibold text-text">{product.category?.name || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Style</span>
                <span className="font-semibold text-text">{product.style?.name || '-'}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-2 pt-2">
                <span className="text-sm font-medium text-muted">Available Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || []).map((size) => (
                    <span
                      key={size.id}
                      className="rounded-md border border-muted/20 bg-muted/5 px-3 py-1 text-sm font-medium text-text"
                    >
                      {size.name}
                    </span>
                  ))}
                  {(!product.sizes || product.sizes.length === 0) && (
                    <span className="text-sm text-muted">No sizes selected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-text">Description</h3>
              <p className="leading-relaxed text-muted whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        description={
          <span>
            Are you sure you want to delete the product <strong>{product.name}</strong>? This action
            cannot be undone.
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
