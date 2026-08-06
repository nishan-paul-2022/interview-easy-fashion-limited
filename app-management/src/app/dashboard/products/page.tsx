'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useMemo } from 'react';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';
import { Dropdown } from '@/components/molecules/Dropdown';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DataTable, DataTableColumn } from '@/components/organisms/DataTable';

interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  style: string;
  sizes: string[];
  price: number;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
}

const mockProducts: Product[] = [
  {
    id: '1',
    image: 'https://via.placeholder.com/100',
    name: 'Classic White T-Shirt',
    category: 'Men',
    style: 'Casual',
    sizes: ['S', 'M', 'L', 'XL'],
    price: 25.99,
    status: 'ACTIVE',
  },
  {
    id: '2',
    image: 'https://via.placeholder.com/100',
    name: 'Floral Summer Dress',
    category: 'Women',
    style: 'Bohemian',
    sizes: ['XS', 'S', 'M'],
    price: 49.5,
    status: 'ACTIVE',
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/100',
    name: 'Kids Denim Jacket',
    category: 'Kids',
    style: 'Vintage',
    sizes: ['4Y', '6Y', '8Y'],
    price: 35.0,
    status: 'OUT_OF_STOCK',
  },
  {
    id: '4',
    image: 'https://via.placeholder.com/100',
    name: 'Leather Crossbody Bag',
    category: 'Accessories',
    style: 'Minimalist',
    sizes: ['ONE SIZE'],
    price: 89.99,
    status: 'DRAFT',
  },
];

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Kids', value: 'Kids' },
  { label: 'Accessories', value: 'Accessories' },
];

const styleOptions = [
  { label: 'All Styles', value: 'all' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Bohemian', value: 'Bohemian' },
  { label: 'Vintage', value: 'Vintage' },
  { label: 'Minimalist', value: 'Minimalist' },
];

const getStatusBadge = (status: Product['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge label="Active" variant="success" />;
    case 'DRAFT':
      return <Badge label="Draft" variant="neutral" />;
    case 'OUT_OF_STOCK':
      return <Badge label="Out of Stock" variant="error" />;
    default:
      return <Badge label={status} variant="neutral" />;
  }
};

export default function ProductListPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Derived filtered data
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStyle = selectedStyle === 'all' || p.style === selectedStyle;
      return matchesSearch && matchesCategory && matchesStyle;
    });
  }, [searchQuery, selectedCategory, selectedStyle]);

  const handleAddClick = () => {
    router.push('/dashboard/products/new');
  };

  const handleEditClick = (product: Product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const handleViewClick = (product: Product) => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log('Deleting product:', productToDelete?.name);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'image',
      header: 'Image',
      render: (row) => (
        <div className="h-12 w-12 overflow-hidden rounded-md border border-muted/20 bg-muted/10">
          {/* Using img tag directly for mock placeholder without external domain config issues */}
          <img
            src={row.image}
            alt={row.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ),
    },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'style', header: 'Style', sortable: true },
    {
      key: 'sizes',
      header: 'Sizes',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.sizes.map((s) => (
            <span key={s} className="px-2 py-0.5 text-xs font-medium rounded bg-muted/10 text-text">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (row) => <span>${row.price.toFixed(2)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => getStatusBadge(row.status) },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      {/* Topbar Actions */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
          <div className="w-full sm:w-[280px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(val) => console.log('Searching:', val)}
              placeholder="Search products..."
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                {categoryOptions.find((o) => o.value === selectedCategory)?.label}
              </Button>
            }
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as string)}
          />
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full sm:w-auto justify-between">
                {styleOptions.find((o) => o.value === selectedStyle)?.label}
              </Button>
            }
            options={styleOptions}
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
        data={filteredProducts}
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
