'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { Toggle } from '@/components/atoms/Toggle';
import { Modal } from '@/components/molecules/Modal';

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  _count?: { products?: number };
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave?: (data: Partial<Category>) => Promise<void> | void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setDescription(category.description || '');
        setIsActive(category.isActive !== false); // default to true if undefined
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onSave) {
      setIsSubmitting(true);
      try {
        await onSave({
          name,
          description,
          isActive,
        });
        onClose();
      } catch {
        // Parent component handles errors (toast)
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} type="button" isLoading={isSubmitting}>
        Save
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add Category'}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
        <Input
          label="Category Name"
          placeholder="e.g. Men's Clothing"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Provide a brief description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoResize
        />

        <div className="pt-2">
          <Toggle
            label="Active Status"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <p className="mt-1 text-xs text-muted">
            Inactive categories will be hidden from the storefront.
          </p>
        </div>
      </form>
    </Modal>
  );
};
