'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Icon } from '@/components/atoms/Icon';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Toggle } from '@/components/atoms/Toggle';
import { Dropdown } from '@/components/molecules/Dropdown';
import { useToast } from '@/components/molecules/Toast';
import { apiClient } from '@/lib/api';

export interface ProductFormData {
  id?: string;
  name: string;
  categoryId: string;
  styleId: string;
  sizeIds: string[];
  description: string;
  price: string;
  isActive: boolean;
  images: string[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
  isEdit?: boolean;
}

interface Option {
  id: string;
  name: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [styleId, setStyleId] = useState(initialData?.styleId || '');
  const [sizeIds, setSizeIds] = useState<string[]>(initialData?.sizeIds || []);
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Existing images (URLs)
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  // New images (Files)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [styles, setStyles] = useState<Option[]>([]);
  const [sizes, setSizes] = useState<Option[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [catRes, styleRes, sizeRes] = await Promise.all([
          apiClient.get<{ data: Option[] }>('/categories', { limit: 100 }),
          apiClient.get<{ data: Option[] }>('/styles', { limit: 100 }),
          apiClient.get<{ data: Option[] }>('/sizes', { limit: 100 }),
        ]);
        setCategories(catRes.data || []);
        setStyles(styleRes.data || []);
        setSizes(sizeRes.data || []);
      } catch (e) {
        console.error('Failed to load options', e);
      }
    }
    loadOptions();
  }, []);

  const handleSizeToggle = (id: string) => {
    setSizeIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles((prev) => [...prev, ...files]);
      const previews = files.map((f) => URL.createObjectURL(f));
      setNewImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]); // free memory
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !styleId || sizeIds.length === 0) {
      toast.error('Please select category, style, and at least one size.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('categoryId', categoryId);
      formData.append('styleId', styleId);
      formData.append('isActive', String(isActive));

      sizeIds.forEach((id) => formData.append('sizeIds[]', id));

      if (isEdit) {
        // In this simple API logic, we might just pass new files
        // and ignore existing URLs depending on backend, but let's pass new files
        newImageFiles.forEach((file) => formData.append('files', file));
        await apiClient.patch(`/products/${initialData?.id}`, formData);
        toast.success('Product updated successfully!');
      } else {
        newImageFiles.forEach((file) => formData.append('files', file));
        await apiClient.post('/products', formData);
        toast.success('Product created successfully!');
      }
      router.push('/products');
    } catch (e: unknown) {
      const err = e as { message?: string | string[] };
      let msg = 'An error occurred';
      if (Array.isArray(err.message)) {
        msg = err.message.join(', ');
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Image Uploader */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-text">Product Images</label>
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted/30 bg-surface p-8 transition-colors hover:bg-muted/5"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Icon name="Upload" size={24} />
          </div>
          <p className="mb-1 text-sm font-medium text-text">Click to upload images</p>
          <p className="text-xs text-muted">PNG, JPG or GIF (max. 5MB)</p>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Thumbnail Preview Strip */}
        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-4">
            {existingImages.map((imgUrl, idx) => (
              <div
                key={`existing-${idx}`}
                className="group relative h-24 w-24 overflow-hidden rounded-lg border border-muted/20"
              >
                <img src={imgUrl} alt={`Existing ${idx}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-error/90 text-white transition-colors hover:bg-error"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            ))}
            {newImagePreviews.map((imgUrl, idx) => (
              <div
                key={`new-${idx}`}
                className="group relative h-24 w-24 overflow-hidden rounded-lg border border-muted/20 border-accent/50"
              >
                <img src={imgUrl} alt={`New ${idx}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-error/90 text-white transition-colors hover:bg-error"
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
              <Button variant="outline" className="w-full justify-between" type="button">
                {categories.find((o) => String(o.id) === String(categoryId))?.name ||
                  'Select Category'}
              </Button>
            }
            options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={categoryId}
            onChange={(val) => setCategoryId(val as string)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text">Style</label>
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full justify-between" type="button">
                {styles.find((o) => String(o.id) === String(styleId))?.name || 'Select Style'}
              </Button>
            }
            options={styles.map((s) => ({ label: s.name, value: String(s.id) }))}
            value={styleId}
            onChange={(val) => setStyleId(val as string)}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text">Available Sizes</label>
        <div className="flex flex-wrap gap-4">
          {sizes.map((size) => (
            <Checkbox
              key={size.id}
              label={size.name}
              checked={sizeIds.includes(String(size.id))}
              onChange={() => handleSizeToggle(String(size.id))}
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
        required
      />

      <div className="pt-2">
        <Toggle
          label="Active Status"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <p className="mt-1 text-xs text-muted">
          Inactive products will not appear in the customer storefront.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-end gap-4 border-t border-muted/20 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/products')}
          type="button"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          Save Product
        </Button>
      </div>
    </form>
  );
};
