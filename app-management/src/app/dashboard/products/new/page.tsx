'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Dropdown } from '@/components/molecules/Dropdown';

const categoryOptions = [
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Kids', value: 'Kids' },
  { label: 'Accessories', value: 'Accessories' },
];

const styleOptions = [
  { label: 'Casual', value: 'Casual' },
  { label: 'Bohemian', value: 'Bohemian' },
  { label: 'Vintage', value: 'Vintage' },
  { label: 'Minimalist', value: 'Minimalist' },
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE', '4Y', '6Y', '8Y'];

export default function ProductCreatePage() {
  const router = useRouter();

  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleSizeToggle = (size: string) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const handleImageMockAdd = () => {
    setImages((prev) => [...prev, `https://via.placeholder.com/150?text=Image+${prev.length + 1}`]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving product...', { name, category, style, sizes, description, price, images });
    router.push('/dashboard/products');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-12">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text">Create New Product</h1>
        <p className="text-sm text-muted">
          Fill in the details to add a new product to your store.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Image Uploader */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-text">Product Images</label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted/30 bg-surface p-8 transition-colors hover:bg-muted/5"
            onClick={handleImageMockAdd}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon name="Upload" size={24} />
            </div>
            <p className="mb-1 text-sm font-medium text-text">Click or drag images to upload</p>
            <p className="text-xs text-muted">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>

          {/* Thumbnail Preview Strip */}
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative h-24 w-24 overflow-hidden rounded-lg border border-muted/20"
                >
                  <img
                    src={imgUrl}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-error/90 text-white transition-colors hover:bg-error"
                      aria-label="Remove image"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Product Name"
            placeholder="e.g. Classic White T-Shirt"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Price ($)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Category</label>
            <Dropdown
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {categoryOptions.find((o) => o.value === category)?.label || 'Select Category'}
                </Button>
              }
              options={categoryOptions}
              value={category}
              onChange={(val) => setCategory(val as string)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text">Style</label>
            <Dropdown
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {styleOptions.find((o) => o.value === style)?.label || 'Select Style'}
                </Button>
              }
              options={styleOptions}
              value={style}
              onChange={(val) => setStyle(val as string)}
            />
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-text">Available Sizes</label>
          <div className="flex flex-wrap gap-4">
            {sizeOptions.map((size) => (
              <Checkbox
                key={size}
                label={size}
                checked={sizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Detailed product description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end gap-4 border-t border-muted/20 pt-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/products')} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Product
          </Button>
        </div>
      </form>
    </div>
  );
}
