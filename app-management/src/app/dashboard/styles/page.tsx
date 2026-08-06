'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Modal } from '@/components/molecules/Modal';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface Style {
  id: string;
  name: string;
  createdDate: string;
}

const mockStyles: Style[] = [
  { id: '1', name: 'Casual', createdDate: '2026-08-01' },
  { id: '2', name: 'Bohemian', createdDate: '2026-08-02' },
  { id: '3', name: 'Vintage', createdDate: '2026-08-03' },
  { id: '4', name: 'Minimalist', createdDate: '2026-08-04' },
  { id: '5', name: 'Streetwear', createdDate: '2026-08-05' },
];

export default function StyleManagementPage() {
  const [styles] = useState<Style[]>(mockStyles);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [styleToEdit, setStyleToEdit] = useState<Style | null>(null);
  const [formName, setFormName] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<Style | null>(null);

  useEffect(() => {
    if (isFormModalOpen) {
      if (styleToEdit) {
        setFormName(styleToEdit.name);
      } else {
        setFormName('');
      }
    }
  }, [isFormModalOpen, styleToEdit]);

  const handleAddClick = () => {
    setStyleToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (style: Style) => {
    setStyleToEdit(style);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (style: Style) => {
    setStyleToDelete(style);
    setIsDeleteModalOpen(true);
  };

  const handleSaveStyle = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving style:', formName);
    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting style:', styleToDelete?.name);
    setIsDeleteModalOpen(false);
    setStyleToDelete(null);
  };

  const columns: DataTableColumn<Style>[] = [
    { key: 'name', header: 'Style Name', sortable: true },
    { key: 'createdDate', header: 'Created Date', sortable: true },
  ];

  const formFooter = (
    <>
      <Button variant="ghost" onClick={() => setIsFormModalOpen(false)} type="button">
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSaveStyle} type="button">
        Save Style
      </Button>
    </>
  );

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Style Management</h1>
          <p className="text-sm text-muted">Manage product styles available in the store.</p>
        </div>
        <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
          Add Style
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={styles}
        emptyProps={{
          icon: 'Palette',
          title: 'No styles yet',
          description: 'Get started by creating your first product style.',
          action: {
            label: 'Add Style',
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
              aria-label="Edit style"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Trash2"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete style"
            />
          </>
        )}
      />

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={styleToEdit ? 'Edit Style' : 'Add Style'}
        footer={formFooter}
      >
        <form onSubmit={handleSaveStyle} className="flex flex-col gap-4 py-2">
          <Input
            label="Style Name"
            placeholder="e.g. Vintage, Casual, Minimalist"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Style"
        description={
          <span>
            Are you sure you want to delete the style <strong>{styleToDelete?.name}</strong>? This
            action cannot be undone.
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setStyleToDelete(null);
        }}
      />
    </div>
  );
}
