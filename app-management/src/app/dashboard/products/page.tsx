'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { useToast } from '@/components/molecules/Toast';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';
import { apiClient } from '@/lib/api';

interface ProductData {
  id: string;
  name: string;
  category?: { id: string; name: string };
  style?: { id: string; name: string };
  sizes?: { id: string; name: string }[];
  price: number;
  status: string;
  images?: string[];
  [key: string]: unknown;
}

const getStatusBadge = (status: string) => {
  switch ((status || '').toUpperCase()) {
    case 'ACTIVE':
      return <Badge label="Active" variant="success" />;
    case 'DRAFT':
      return <Badge label="Draft" variant="warning" />;
    case 'OUT_OF_STOCK':
      return <Badge label="Out of Stock" variant="error" />;
    default:
      return <Badge label={status || 'Unknown'} variant="neutral" />;
  }
};

export default function ProductListPage() {
  const router = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([
    { label: 'All Categories', value: 'all' },
  ]);
  const [styles, setStyles] = useState<{ label: string; value: string }[]>([
    { label: 'All Styles', value: 'all' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductData | null>(null);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [catRes, styleRes] = await Promise.all([
          apiClient
            .get<{ data: { id: string; name: string }[] }>('/categories', { limit: 100 })
            .catch(() => ({ data: [] })),
          apiClient
            .get<{ data: { id: string; name: string }[] }>('/styles', { limit: 100 })
            .catch(() => ({ data: [] })),
        ]);

        setCategories([
          { label: 'All Categories', value: 'all' },
          ...(catRes.data || []).map((c) => ({ label: c.name, value: c.id })),
        ]);

        setStyles([
          { label: 'All Styles', value: 'all' },
          ...(styleRes.data || []).map((s) => ({ label: s.name, value: s.id })),
        ]);
      } catch (e) {
        console.error('Failed to load filters', e);
      }
    }
    fetchFilters();
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }
      if (selectedStyle !== 'all') {
        params.styleId = selectedStyle;
      }

      const res = await apiClient.get<{ data: ProductData[] }>('/products', params);
      setProducts(res.data || []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedStyle, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddClick = () => {
    router.push('/dashboard/products/new');
  };

  const handleEditClick = (product: ProductData) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const handleViewClick = (product: ProductData) => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const handleDeleteClick = (product: ProductData) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) {
      return;
    }
    try {
      await apiClient.delete(`/products/${productToDelete.id}`);
      toast.success(`Product "${productToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const columns: DataTableColumn<ProductData>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (row) => {
        const imgUrl =
          row.images?.[0] ||
          'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=100';
        return (
          <div className="h-12 w-12 overflow-hidden rounded-md border border-muted/20 bg-muted/10">
            <img
              src={imgUrl}
              alt={row.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        );
      },
    },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span>{row.category?.name || '-'}</span>,
    },
    { key: 'style', header: 'Style', render: (row) => <span>{row.style?.name || '-'}</span> },
    {
      key: 'sizes',
      header: 'Sizes',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.sizes || []).map((s) => (
            <span
              key={s.id}
              className="px-2 py-0.5 text-xs font-medium rounded bg-muted/10 text-text"
            >
              {s.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => <span>${Number(row.price || 0).toFixed(2)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => getStatusBadge(row.status) },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Topbar Actions */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
          <div className="w-full sm:w-72">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setDebouncedSearch}
              placeholder="Search products..."
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                {categories.find((o) => o.value === selectedCategory)?.label || 'All Categories'}
              </Button>
            }
            options={categories}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as string)}
          />
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                {styles.find((o) => o.value === selectedStyle)?.label || 'All Styles'}
              </Button>
            }
            options={styles}
            value={selectedStyle}
            onChange={(val) => setSelectedStyle(val as string)}
          />
        </div>

        <Button
          variant="primary"
          leftIcon="Plus"
          onClick={handleAddClick}
          className="w-full xl:w-auto shrink-0"
        >
          Add Product
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyProps={{
          icon: 'Package',
          title: 'No products yet',
          description: 'Get started by creating your first product.',
          action: {
            label: 'Add Product',
            onClick: handleAddClick,
          },
        }}
        rowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Eye"
              onClick={() => handleViewClick(row)}
              aria-label="View product"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Pencil"
              onClick={() => handleEditClick(row)}
              aria-label="Edit product"
            />
            <Button
              variant="ghost"
              size="sm"
              leftIcon="Trash2"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={() => handleDeleteClick(row)}
              aria-label="Delete product"
            />
          </>
        )}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        description={
          <span>
            Are you sure you want to delete the product <strong>{productToDelete?.name}</strong>?
            This action cannot be undone.
          </span>
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
