'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { useToast } from '@/components/molecules/Toast';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { SimpleEntityFormModal, SimpleEntity } from '@/components/organisms/SimpleEntityFormModal';
import { apiClient } from '@/lib/api';

export default function SizeManagementPage() {
  const toast = useToast();

  const [sizes, setSizes] = useState<SimpleEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [sizeToEdit, setSizeToEdit] = useState<SimpleEntity | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState<SimpleEntity | null>(null);

  const fetchSizes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: SimpleEntity[] }>('/sizes', { limit: 100 });
      setSizes(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch sizes');
      setSizes([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  const handleAddClick = () => {
    setSizeToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (size: SimpleEntity) => {
    setSizeToEdit(size);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (size: SimpleEntity) => {
    setSizeToDelete(size);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSize = async (data: { value: string }) => {
    try {
      if (sizeToEdit) {
        await apiClient.patch(`/sizes/${sizeToEdit.id}`, { label: data.value });
        toast.success(`Size updated successfully.`);
      } else {
        await apiClient.post('/sizes', { label: data.value });
        toast.success(`Size created successfully.`);
      }
      setIsFormModalOpen(false);
      setSizeToEdit(null);
      fetchSizes();
    } catch (e: unknown) {
      const err = e as { message?: string | string[] };
      let msg = 'An error occurred';
      if (Array.isArray(err.message)) {
        msg = err.message.join(', ');
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
      throw e;
    }
  };

  const handleConfirmDelete = async () => {
    if (!sizeToDelete) {
      return;
    }
    try {
      await apiClient.delete(`/sizes/${sizeToDelete.id}`);
      toast.success(`Size deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSizeToDelete(null);
      fetchSizes();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to delete size');
    }
  };

  const columns: DataTableColumn<SimpleEntity>[] = [
    {
      key: 'label',
      header: 'Size Label',
      sortable: true,
      render: (row) => row.label || row.name || '-',
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (row) => (
        <span>{row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '-'}</span>
      ),
    },
  ];

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
        isLoading={isLoading}
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
      <SimpleEntityFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSizeToEdit(null);
        }}
        entity={sizeToEdit}
        onSave={handleSaveSize}
        titleAdd="Add Size"
        titleEdit="Edit Size"
        inputLabel="Size Label"
        inputPlaceholder="e.g. XXL, 10, ONE SIZE"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Size"
        description={
          <span>
            Are you sure you want to delete the size{' '}
            <strong>{sizeToDelete?.label || sizeToDelete?.name}</strong>? This action cannot be
            undone.
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
