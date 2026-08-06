'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { useState } from 'react';

import { Badge } from '../../../components/atoms/Badge';
import { Button } from '../../../components/atoms/Button';
import { Icon } from '../../../components/atoms/Icon';
import { ImageGallery } from '../../../components/molecules/ImageGallery';
import { useToast } from '../../../components/molecules/Toast';

// Mock product fetching
const getMockProduct = (id: string) => {
  // In a real app we would fetch based on id. We use a static mock here.
  return {
    id,
    name: 'Classic White Tee',
    category: 'T-Shirts',
    styleName: 'Casual',
    description:
      'Crafted from 100% organic cotton, this classic white tee offers a relaxed fit and unparalleled comfort. Perfect for everyday wear, it pairs effortlessly with any outfit. Pre-shrunk to maintain its shape wash after wash.',
    price: 29.99,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3db8?auto=format&fit=crop&q=80&w=1200',
    ],
  };
};

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const product = getMockProduct(params.id);
  const { success } = useToast();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);

  if (!product) {
    notFound();
  }

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);

    // Mock add to cart success
    success(`Added ${quantity}x ${product.name} (Size: ${selectedSize}) to cart`);
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
          href={`/products?category=${product.category}`}
          className="hover:text-accent transition-colors"
        >
          {product.category}
        </Link>
        <Icon name="ChevronRight" size={16} />
        <span className="text-text font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div>
          <ImageGallery images={product.images} />
        </div>

        {/* Right Column: Product Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="info" label={product.category} />
              <Badge variant="neutral" label={product.styleName} />
            </div>
            <h1 className="text-3xl font-bold text-text md:text-4xl">{product.name}</h1>
            <p className="text-2xl font-semibold text-accent">${product.price.toFixed(2)}</p>
          </div>

          <div className="h-px w-full bg-muted/20" />

          {/* Description */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-text">Description</h3>
            <p className="text-muted leading-relaxed">{product.description}</p>
          </div>

          <div className="h-px w-full bg-muted/20" />

          {/* Size Selection */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text">
                Select Size <span className="text-error">*</span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setShowSizeError(false);
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border font-medium transition-all ${
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
                <Icon name="AlertTriangle" size={14} /> Please select a size before adding to cart.
              </p>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col gap-4 sm:flex-row mt-4">
            <div className="flex h-12 w-32 items-center justify-between rounded-lg border border-muted/30 bg-surface px-4">
              <button
                onClick={handleDecrement}
                className="text-muted hover:text-text disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Icon name="Minus" size={16} />
              </button>
              <span className="font-semibold text-text">{quantity}</span>
              <button onClick={handleIncrement} className="text-muted hover:text-text">
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
