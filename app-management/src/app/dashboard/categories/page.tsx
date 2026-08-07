'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useToast } from '@/components/molecules/Toast';
import { Category, CategoryFormModal } from '@/components/organisms/CategoryFormModal';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { apiClient } from '@/lib/api';

interface PaginatedCategories {
  data: Category[];
}

export default function CategoryListPage() {
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams: Record<string, string> = { limit: '100' };
      if (debouncedSearch) {
        queryParams.search = debouncedSearch;
      }
      const res = await apiClient.get<PaginatedCategories>('/categories', queryParams);
      setCategories(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) {
      return;
    }
    try {
      await apiClient.delete(`/categories/${categoryToDelete.id}`);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    setCategoryToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleFormSave = async (data: Partial<Category>) => {
    try {
      if (categoryToEdit) {
        await apiClient.patch(`/categories/${categoryToEdit.id}`, data);
        toast.success(`Category updated successfully.`);
      } else {
        await apiClient.post('/categories', data);
        toast.success(`Category created successfully.`);
      }
      setIsFormModalOpen(false);
      setCategoryToEdit(null);
      fetchCategories();
    } catch (e: unknown) {
      const err = e as { message?: string | string[] };
      let msg = 'An error occurred';
      if (Array.isArray(err.message)) {
        msg = err.message.join(', ');
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
      throw e; // re-throw so the modal form can catch it if needed (but we show toast anyway)
    }
  };

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'productsCount',
      header: 'Products Count',
      render: (row) => <span>{row._count?.products || 0}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (row) => (
        <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          label={row.isActive ? 'Active' : 'Inactive'}
          variant={row.isActive ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Topbar Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setDebouncedSearch}
            placeholder="Search categories..."
          />
        </div>
        <Button variant="primary" leftIcon="Plus" onClick={handleAddClick}>
          Add Category
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyProps={{
          icon: 'Folder',
          title: 'No categories yet',
          description: 'Get started by creating your first product category.',
          action: {
            label: 'Add Category',
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
              aria-label="Edit category"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Trash2"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete category"
            />
          </>
        )}
      />

      {/* Create / Edit Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCategoryToEdit(null);
        }}
        category={categoryToEdit}
        onSave={handleFormSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Category"
        description={
          <span>
            Are you sure you want to delete the category <strong>{categoryToDelete?.name}</strong>?
            This action cannot be undone.
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
