'use client';

import { useRouter, useParams } from 'next/navigation';
import React, { useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { ImageGallery } from '@/components/molecules/ImageGallery';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge label="Active" variant="success" />;
    case 'DRAFT':
      return <Badge label="Draft" variant="neutral" />;
    case 'OUT_OF_STOCK':
      return <Badge label="Out of Stock" variant="error" />;
    default:
      return <Badge label={status} variant="neutral" />;
  }
};

const mockProduct = {
  id: '1',
  name: 'Classic White T-Shirt',
  category: 'Men',
  style: 'Casual',
  sizes: ['S', 'M', 'L', 'XL'],
  price: 25.99,
  status: 'ACTIVE',
  description:
    'A premium cotton classic white t-shirt. Perfect for everyday wear, versatile, and breathable. Designed with durability and ultimate comfort in mind, this piece will become a staple in your wardrobe.',
  images: [
    'https://via.placeholder.com/600?text=Image+1',
    'https://via.placeholder.com/600?text=Image+2',
    'https://via.placeholder.com/600?text=Image+3',
  ],
};

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // In a real app, you would fetch the product using productId.
  // We'll use mockProduct for the UI mockup.
  const product = { ...mockProduct, id: productId || mockProduct.id };

  const handleEditClick = () => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting product:', product.name);
    setIsDeleteModalOpen(false);
    router.push('/dashboard/products');
  };

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
          <ImageGallery images={product.images} />
        </div>

        {/* Right Col: Metadata */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-text">{product.name}</h2>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-accent">${product.price.toFixed(2)}</span>
              {getStatusBadge(product.status)}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-y-4 rounded-xl border border-muted/20 bg-surface p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Category</span>
                <span className="font-semibold text-text">{product.category}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">Style</span>
                <span className="font-semibold text-text">{product.style}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-2 pt-2">
                <span className="text-sm font-medium text-muted">Available Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="rounded-md border border-muted/20 bg-muted/5 px-3 py-1 text-sm font-medium text-text"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-text">Description</h3>
              <p className="leading-relaxed text-muted">{product.description}</p>
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
