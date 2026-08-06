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
  productsCount: number;
  createdDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave?: (data: Partial<Category>) => void;
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

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setDescription(category.description || '');
        setIsActive(category.status === 'ACTIVE');
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
      }
    }
  }, [isOpen, category]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onSave) {
      onSave({
        name,
        description,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
      });
    }
    onClose();
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} type="button">
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
