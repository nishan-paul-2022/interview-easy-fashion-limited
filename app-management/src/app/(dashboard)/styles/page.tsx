'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { useToast } from '@/components/molecules/Toast';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { SimpleEntityFormModal, SimpleEntity } from '@/components/organisms/SimpleEntityFormModal';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { apiClient } from '@/lib/api';

export default function StyleManagementPage() {
  const toast = useToast();
  const { user } = useDashboardAuth();
  const isManager = user?.role === 'MANAGER';

  const [styles, setStyles] = useState<SimpleEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [styleToEdit, setStyleToEdit] = useState<SimpleEntity | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<SimpleEntity | null>(null);

  const fetchStyles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: SimpleEntity[] }>('/styles', { limit: 100 });
      setStyles(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch styles');
      setStyles([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStyles();
  }, [fetchStyles]);

  const handleAddClick = () => {
    setStyleToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (style: SimpleEntity) => {
    setStyleToEdit(style);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (style: SimpleEntity) => {
    setStyleToDelete(style);
    setIsDeleteModalOpen(true);
  };

  const handleSaveStyle = async (data: { value: string }) => {
    if (isManager) {
      toast.error('You do not have permission to modify styles.');
      return;
    }
    try {
      if (styleToEdit) {
        await apiClient.patch(`/styles/${styleToEdit.id}`, { name: data.value });
        toast.success(`Style updated successfully.`);
      } else {
        await apiClient.post('/styles', { name: data.value });
        toast.success(`Style created successfully.`);
      }
      setIsFormModalOpen(false);
      setStyleToEdit(null);
      fetchStyles();
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
    if (isManager) {
      toast.error('You do not have permission to delete styles.');
      return;
    }
    if (!styleToDelete) {
      return;
    }
    try {
      await apiClient.delete(`/styles/${styleToDelete.id}`);
      toast.success(`Style deleted successfully.`);
      setIsDeleteModalOpen(false);
      setStyleToDelete(null);
      fetchStyles();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to delete style');
    }
  };

  const columns: DataTableColumn<SimpleEntity>[] = [
    {
      key: 'name',
      header: 'Style Name',
      sortable: true,
      render: (row) => row.name || row.label || '-',
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
          <h1 className="text-2xl font-bold text-text">Style Management</h1>
          <p className="text-sm text-muted">Manage product styles available in the store.</p>
        </div>
        {!isManager && (
          <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
            Add Style
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={styles}
        isLoading={isLoading}
        emptyProps={{
          icon: 'Palette',
          title: 'No styles yet',
          description: 'Get started by creating your first product style.',
          action: isManager
            ? undefined
            : {
                label: 'Add Style',
                onClick: handleAddClick,
              },
        }}
        rowActions={
          isManager
            ? undefined
            : (row) => (
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
              )
        }
      />

      {/* Create / Edit Form Modal */}
      <SimpleEntityFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStyleToEdit(null);
        }}
        entity={styleToEdit}
        onSave={handleSaveStyle}
        titleAdd="Add Style"
        titleEdit="Edit Style"
        inputLabel="Style Name"
        inputPlaceholder="e.g. Vintage, Casual, Minimalist"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Style"
        description={
          <span>
            Are you sure you want to delete the style{' '}
            <strong>{styleToDelete?.name || styleToDelete?.label}</strong>? This action cannot be
            undone.
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
