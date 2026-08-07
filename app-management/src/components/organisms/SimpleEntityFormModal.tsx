'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';

export interface SimpleEntity {
  id: string;
  name?: string;
  label?: string;
  createdAt?: string;
}

export interface SimpleEntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity?: SimpleEntity | null;
  onSave?: (data: { value: string }) => Promise<void> | void;
  titleAdd: string;
  titleEdit: string;
  inputLabel: string;
  inputPlaceholder: string;
}

export const SimpleEntityFormModal: React.FC<SimpleEntityFormModalProps> = ({
  isOpen,
  onClose,
  entity,
  onSave,
  titleAdd,
  titleEdit,
  inputLabel,
  inputPlaceholder,
}) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (entity) {
        setValue(entity.name || entity.label || '');
      } else {
        setValue('');
      }
    }
  }, [isOpen, entity]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onSave && value.trim()) {
      setIsSubmitting(true);
      try {
        await onSave({ value: value.trim() });
        onClose();
      } catch {
        // Handled by parent
      } finally {
        setIsSubmitting(false);
      }
    } else if (!onSave) {
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} type="button" disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        type="button"
        isLoading={isSubmitting}
        disabled={!value.trim()}
      >
        Save
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={entity ? titleEdit : titleAdd} footer={footer}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
        <Input
          label={inputLabel}
          placeholder={inputPlaceholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};
