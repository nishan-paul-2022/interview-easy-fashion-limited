'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ImageGallery } from '@/components/molecules/ImageGallery';
import { Skeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/api';

interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category?: { id: string | number; name: string };
  style?: { id: string | number; name: string };
  sizes?: { name: string }[];
  images?: string[];
}

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { success } = useToast();
  const { dispatch } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const res = await apiClient.get<ProductDetail>(`/products/${params.id}`);
        if (mounted) {
          setProduct(res);
        }
      } catch {
        if (mounted) {
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
        <Skeleton height={20} width={200} className="mb-4" />
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <Skeleton height={500} width="100%" />
          <div className="flex flex-col gap-6">
            <Skeleton height={40} width="80%" />
            <Skeleton height={30} width={100} />
            <Skeleton height={150} width="100%" />
            <Skeleton height={80} width="100%" />
            <Skeleton height={50} width="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20">
        <EmptyState
          icon="Package"
          title="Product not found"
          description="The product you are looking for does not exist or has been removed."
          action={{
            label: 'Back to Products',
            onClick: () => router.push('/products'),
          }}
        />
      </div>
    );
  }

  const categoryName = product.category?.name || 'Uncategorized';
  const styleName = product.style?.name || 'Standard';
  const sizeNames = product.sizes?.map((s) => s.name) || [];
  const imageUrls = product.images?.length
    ? product.images.map((img: unknown) =>
        typeof img === 'string' ? img : (img as { url: string }).url,
      )
    : [
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hkzrv0ol'}/image/upload/v1786260049/easy-fashion-seed/clothes-rack.jpg`,
      ];

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (sizeNames.length > 0 && !selectedSize) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
        productId: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        size: selectedSize || 'OS',
        quantity,
        imageUrl: imageUrls[0],
      },
    });

    success(
      `Added ${quantity}x ${product.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} to cart`,
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          Home
        </Link>
        <Icon name="ChevronRight" size={16} />
        <Link
          href={`/products?categoryId=${product.category?.id || ''}`}
          className="hover:text-accent transition-colors"
        >
          {categoryName}
        </Link>
        <Icon name="ChevronRight" size={16} />
        <span className="text-text font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div>
          <ImageGallery images={imageUrls} />
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="info" label={categoryName} />
              <Badge variant="neutral" label={styleName} />
            </div>
            <h1 className="text-3xl font-bold text-text md:text-4xl">{product.name}</h1>
            <p className="text-2xl font-semibold text-accent">
              ${Number(product.price || 0).toFixed(2)}
            </p>
          </div>

          <div className="h-px w-full bg-muted/20" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-text">Description</h3>
            <p className="text-muted leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description available.'}
            </p>
          </div>

          <div className="h-px w-full bg-muted/20" />

          {/* Size Selection */}
          {sizeNames.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text">
                  Select Size <span className="text-error">*</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizeNames.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeError(false);
                    }}
                    className={`flex h-12 min-w-12 px-3 items-center justify-center rounded-lg border font-medium transition-all ${
                      selectedSize === size
                        ? 'border-accent bg-accent text-white'
                        : 'border-muted/30 bg-surface text-text hover:border-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {showSizeError && (
                <p className="text-sm text-error flex items-center gap-1 mt-1">
                  <Icon name="AlertTriangle" size={14} /> Please select a size before adding to
                  cart.
                </p>
              )}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row mt-4">
            <div className="flex h-12 w-32 items-center justify-between rounded-lg border border-muted/30 bg-surface px-4">
              <button
                onClick={handleDecrement}
                className="text-muted hover:text-text disabled:opacity-50"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Icon name="Minus" size={16} />
              </button>
              <span className="font-semibold text-text">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="text-muted hover:text-text"
                aria-label="Increase quantity"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leftIcon="ShoppingBag"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Shipping / Returns Promises */}
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-muted/20 bg-muted/5 p-4">
            <div className="flex items-center gap-3">
              <Icon name="Package" size={20} className="text-muted" />
              <span className="text-sm text-text">Free standard shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Shield" size={20} className="text-muted" />
              <span className="text-sm text-text">30-day hassle-free return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
