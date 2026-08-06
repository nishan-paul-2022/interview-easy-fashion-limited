'use client';

import React, { useState, useMemo } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface Category {
  id: string;
  name: string;
  productsCount: number;
  createdDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockCategories: Category[] = [
  { id: '1', name: 'Men', productsCount: 120, createdDate: '2026-08-01', status: 'ACTIVE' },
  { id: '2', name: 'Women', productsCount: 185, createdDate: '2026-08-02', status: 'ACTIVE' },
  { id: '3', name: 'Kids', productsCount: 45, createdDate: '2026-08-03', status: 'INACTIVE' },
  { id: '4', name: 'Accessories', productsCount: 89, createdDate: '2026-08-04', status: 'ACTIVE' },
  { id: '5', name: 'Shoes', productsCount: 60, createdDate: '2026-08-05', status: 'ACTIVE' },
];

export default function CategoryListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return mockCategories;
    const lowerQuery = searchQuery.toLowerCase();
    return mockCategories.filter((cat) => cat.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery]);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Implement delete logic here in Phase 12
    console.log('Deleting category:', categoryToDelete?.name);
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleEditClick = (category: Category) => {
    // Navigation to edit page logic here
    console.log('Editing category:', category.name);
  };

  const columns: DataTableColumn<Category>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'productsCount', header: 'Products Count', sortable: true },
    { key: 'createdDate', header: 'Created Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          label={row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          variant={row.status === 'ACTIVE' ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Topbar Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(val) => console.log('Searching:', val)}
            placeholder="Search categories..."
          />
        </div>
        <Button variant="primary" leftIcon="Plus">
          Add Category
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        emptyProps={{
          icon: 'Folder',
          title: 'No categories yet',
          description: 'Get started by creating your first product category.',
          action: {
            label: 'Add Category',
            onClick: () => console.log('Add Category clicked'),
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
