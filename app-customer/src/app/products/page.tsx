'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { Dropdown } from '@/components/molecules/Dropdown';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Pagination } from '@/components/molecules/Pagination';
import { ProductCard } from '@/components/molecules/ProductCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { ProductGridSkeleton } from '@/components/molecules/Skeleton';

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
];

const MOCK_PRODUCTS = Array.from({ length: 24 }).map((_, i) => ({
  id: `prd_${i}`,
  name: `Premium Product ${i + 1}`,
  category: ['Shirts', 'Pants', 'Jackets', 'Accessories'][i % 4],
  styleName: ['Casual', 'Formal', 'Streetwear', 'Athletic'][i % 4],
  sizes: ['S', 'M', 'L', 'XL'].slice(0, (i % 3) + 2),
  price: 29.99 + i * 5.5,
  imageUrl: MOCK_IMAGES[i % MOCK_IMAGES.length],
}));

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const categoryParams = searchParams.get('category')?.split(',') || [];
  const sizeParams = searchParams.get('size')?.split(',') || [];
  const styleParams = searchParams.get('style')?.split(',') || [];
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchValue, setSearchValue] = useState(searchQuery);

  useEffect(() => {
    // Mock loading delay
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Filter logic
      let filtered = MOCK_PRODUCTS;

      if (categoryParams.length) {
        filtered = filtered.filter((p) => categoryParams.includes(p.category));
      }
      if (sizeParams.length) {
        filtered = filtered.filter((p) => p.sizes.some((s) => sizeParams.includes(s)));
      }
      if (styleParams.length) {
        filtered = filtered.filter((p) => styleParams.includes(p.styleName));
      }
      if (searchQuery) {
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      setProducts(filtered);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchParams, categoryParams, sizeParams, styleParams, searchQuery]);

  const updateQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset page when filtering
    if (name !== 'page') params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (key: string) => (val: string | string[]) => {
    const valueStr = Array.isArray(val) ? val.join(',') : val;
    updateQueryString(key, valueStr);
  };

  // Pagination logic
  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const filterOptions = {
    category: [
      { label: 'Shirts', value: 'Shirts' },
      { label: 'Pants', value: 'Pants' },
      { label: 'Jackets', value: 'Jackets' },
      { label: 'Accessories', value: 'Accessories' },
    ],
    size: [
      { label: 'S', value: 'S' },
      { label: 'M', value: 'M' },
      { label: 'L', value: 'L' },
      { label: 'XL', value: 'XL' },
    ],
    style: [
      { label: 'Casual', value: 'Casual' },
      { label: 'Formal', value: 'Formal' },
      { label: 'Streetwear', value: 'Streetwear' },
      { label: 'Athletic', value: 'Athletic' },
    ],
  };

  const DropdownTrigger = ({ label, activeCount }: { label: string; activeCount: number }) => (
    <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-muted/30 bg-surface px-4 py-2 transition-colors hover:border-accent">
      <span className="text-sm font-medium">{label}</span>
      {activeCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
          {activeCount}
        </span>
      )}
      <Icon name="ChevronLeft" size={16} className="-rotate-90" />
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row">
      {/* Sidebar Filters - Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col gap-6 md:flex">
        <h2 className="text-xl font-bold text-text">Filters</h2>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-text">Category</h3>
          {filterOptions.category.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-muted/30 text-accent focus:ring-accent"
                checked={categoryParams.includes(opt.value)}
                onChange={(e) => {
                  const newParams = e.target.checked
                    ? [...categoryParams, opt.value]
                    : categoryParams.filter((c) => c !== opt.value);
                  handleFilterChange('category')(newParams);
                }}
              />
              <span className="text-sm text-muted hover:text-text">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-text">Size</h3>
          {filterOptions.size.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-muted/30 text-accent focus:ring-accent"
                checked={sizeParams.includes(opt.value)}
                onChange={(e) => {
                  const newParams = e.target.checked
                    ? [...sizeParams, opt.value]
                    : sizeParams.filter((c) => c !== opt.value);
                  handleFilterChange('size')(newParams);
                }}
              />
              <span className="text-sm text-muted hover:text-text">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-text">Style</h3>
          {filterOptions.style.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-muted/30 text-accent focus:ring-accent"
                checked={styleParams.includes(opt.value)}
                onChange={(e) => {
                  const newParams = e.target.checked
                    ? [...styleParams, opt.value]
                    : styleParams.filter((c) => c !== opt.value);
                  handleFilterChange('style')(newParams);
                }}
              />
              <span className="text-sm text-muted hover:text-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-text">Product Catalog</h1>

          <div className="w-full sm:w-72">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={(val) => updateQueryString('q', val)}
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Mobile Filters (Dropdowns) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:hidden">
          <Dropdown
            trigger={<DropdownTrigger label="Category" activeCount={categoryParams.length} />}
            options={filterOptions.category}
            multiple
            value={categoryParams}
            onChange={handleFilterChange('category')}
          />
          <Dropdown
            trigger={<DropdownTrigger label="Size" activeCount={sizeParams.length} />}
            options={filterOptions.size}
            multiple
            value={sizeParams}
            onChange={handleFilterChange('size')}
          />
          <Dropdown
            trigger={<DropdownTrigger label="Style" activeCount={styleParams.length} />}
            options={filterOptions.style}
            multiple
            value={styleParams}
            onChange={handleFilterChange('style')}
          />
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateQueryString('page', page.toString())}
              />
            </div>
          </>
        ) : (
          <EmptyState
            icon="Search"
            title="No products found"
            description="Try adjusting your filters or search query to find what you're looking for."
            action={{
              label: 'Clear Filters',
              onClick: () => router.push(pathname),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <ProductGridSkeleton />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
