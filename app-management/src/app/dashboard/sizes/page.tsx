'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Modal } from '@/components/molecules/Modal';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface Size {
  id: string;
  label: string;
  createdDate: string;
}

const mockSizes: Size[] = [
  { id: '1', label: 'XS', createdDate: '2026-08-01' },
  { id: '2', label: 'S', createdDate: '2026-08-02' },
  { id: '3', label: 'M', createdDate: '2026-08-03' },
  { id: '4', label: 'L', createdDate: '2026-08-04' },
  { id: '5', label: 'XL', createdDate: '2026-08-05' },
  { id: '6', label: 'ONE SIZE', createdDate: '2026-08-06' },
];

export default function SizeManagementPage() {
  const [sizes] = useState<Size[]>(mockSizes);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [sizeToEdit, setSizeToEdit] = useState<Size | null>(null);
  const [formLabel, setFormLabel] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<Size | null>(null);

  useEffect(() => {
    if (isFormModalOpen) {
      if (sizeToEdit) {
        setFormLabel(sizeToEdit.label);
      } else {
        setFormLabel('');
      }
    }
  }, [isFormModalOpen, sizeToEdit]);

  const handleAddClick = () => {
    setSizeToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (size: Size) => {
    setSizeToEdit(size);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (size: Size) => {
    setSizeToDelete(size);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSize = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving size:', formLabel);
    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting size:', sizeToDelete?.label);
    setIsDeleteModalOpen(false);
    setSizeToDelete(null);
  };

  const columns: DataTableColumn<Size>[] = [
    { key: 'label', header: 'Size Label', sortable: true },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  const formFooter = (
    <>
      <Button variant="ghost" onClick={() => setIsFormModalOpen(false)} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSaveSize} type="button">
        Save Size
      </Button>
    </>
  );

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Size Management</h1>
          <p className="text-sm text-muted">Manage product sizes available in the store.</p>
        </div>
        <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
          Add Size
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={sizes}
        emptyProps={{
          icon: 'Ruler',
          title: 'No sizes yet',
          description: 'Get started by creating your first product size.',
          action: {
            label: 'Add Size',
            onClick: handleAddClick,
          },
        }}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Pencil"
              onClick={() => handleEditClick(row)}
              aria-label="Edit size"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Trash2"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete size"
            />
          </>
        )}
      />

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={sizeToEdit ? 'Edit Size' : 'Add Size'}
        footer={formFooter}
      >
        <form onSubmit={handleSaveSize} className="flex flex-col gap-4 py-2">
          <Input
            label="Size Label"
            placeholder="e.g. XXL, 10, ONE SIZE"
            value={formLabel}
            onChange={(e) => setFormLabel(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Size"
        description={
          <span>
            Are you sure you want to delete the size <strong>{sizeToDelete?.label}</strong>? This
            action cannot be undone.
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSizeToDelete(null);
        }}
      />
    </div>
  );
}
