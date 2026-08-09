'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState, useMemo } from 'react';

import { Icon } from '@/components/atoms/Icon';
import { Dropdown } from '@/components/molecules/Dropdown';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Pagination } from '@/components/molecules/Pagination';
import { ProductCardProps, ProductCard } from '@/components/molecules/ProductCard';
import { SearchBar } from '@/components/molecules/SearchBar';
import { ProductGridSkeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/api';

interface FilterOptionResponse {
  id: string | number;
  name?: string;
  label?: string;
}

interface ProductResponse {
  id: string;
  name: string;
  price: number | string;
  category?: { name: string };
  style?: { name: string };
  sizes?: { name: string }[];
  images?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: { total: number; lastPage: number };
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dispatch } = useCart();
  const { success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const handleAddToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) {
      return;
    }

    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'OS';

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: size ? `${product.id || ''}-${size}` : product.id || '',
        productId: product.id || '',
        name: product.name || '',
        price: product.price || 0,
        size,
        quantity: 1,
        imageUrl: product.imageUrl || '',
      },
    });

    success(`Added ${product.name || ''} (Size: ${size}) to cart`);
  };

  const [filterOptions, setFilterOptions] = useState<{
    category: { label: string; value: string }[];
    size: { label: string; value: string }[];
    style: { label: string; value: string }[];
  }>({
    category: [],
    size: [],
    style: [],
  });

  const categoryParams = useMemo(
    () => searchParams.get('categoryId')?.split(',') || [],
    [searchParams],
  );
  const sizeParams = useMemo(() => searchParams.get('sizeId')?.split(',') || [], [searchParams]);
  const styleParams = useMemo(() => searchParams.get('styleId')?.split(',') || [], [searchParams]);
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);

  const [searchValue, setSearchValue] = useState(searchQuery);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [categoriesRes, stylesRes, sizesRes] = await Promise.all([
          apiClient
            .get<PaginatedResponse<FilterOptionResponse>>('/categories')
            .catch(() => ({ data: [] })),
          apiClient
            .get<PaginatedResponse<FilterOptionResponse>>('/styles')
            .catch(() => ({ data: [] })),
          apiClient
            .get<PaginatedResponse<FilterOptionResponse>>('/sizes')
            .catch(() => ({ data: [] })),
        ]);

        setFilterOptions({
          category: (categoriesRes?.data || []).map((c) => ({
            label: c.name || '',
            value: String(c.id),
          })),
          style: (stylesRes?.data || []).map((s) => ({ label: s.name || '', value: String(s.id) })),
          size: (sizesRes?.data || []).map((s) => ({
            label: s.label || s.name || '',
            value: String(s.id),
          })),
        });
      } catch {
        console.error('Failed to fetch filter options');
      }
    }
    fetchFilters();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit,
        };
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (categoryParams.length) {
          params.categoryId = categoryParams.join(',');
        }
        if (styleParams.length) {
          params.styleId = styleParams.join(',');
        }
        if (sizeParams.length) {
          params.sizeId = sizeParams.join(',');
        }

        const res = await apiClient.get<PaginatedResponse<ProductResponse>>('/products', params);

        if (mounted) {
          const formattedProducts: ProductCardProps[] = (res?.data || []).map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category?.name || 'Uncategorized',
            styleName: p.style?.name || 'Standard',
            sizes: p.sizes?.map((s) => s.name) || [],
            price: Number(p.price) || 0,
            imageUrl:
              (typeof p.images?.[0] === 'string'
                ? p.images[0]
                : (p.images?.[0] as unknown as { url: string })?.url) ||
              `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hkzrv0ol'}/image/upload/v1786260049/easy-fashion-seed/clothes-rack.jpg`,
          }));
          setProducts(formattedProducts);
          setTotalPages(res?.meta?.lastPage || Math.ceil((res?.meta?.total || 0) / limit) || 1);
        }
      } catch {
        if (mounted) {
          setProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [searchQuery, categoryParams, sizeParams, styleParams, currentPage, limit]);

  const updateQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    if (name !== 'page') {
      params.delete('page');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (key: string) => (val: string | string[]) => {
    const valueStr = Array.isArray(val) ? val.join(',') : val;
    updateQueryString(key, valueStr);
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
                  handleFilterChange('categoryId')(newParams);
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
                  handleFilterChange('sizeId')(newParams);
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
                  handleFilterChange('styleId')(newParams);
                }}
              />
              <span className="text-sm text-muted hover:text-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-text">Product Catalog</h1>

          <div className="w-full sm:w-72">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={(val) => updateQueryString('search', val)}
              placeholder="Search products..."
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:hidden">
          <Dropdown
            trigger={<DropdownTrigger label="Category" activeCount={categoryParams.length} />}
            options={filterOptions.category}
            multiple
            value={categoryParams}
            onChange={handleFilterChange('categoryId')}
          />
          <Dropdown
            trigger={<DropdownTrigger label="Size" activeCount={sizeParams.length} />}
            options={filterOptions.size}
            multiple
            value={sizeParams}
            onChange={handleFilterChange('sizeId')}
          />
          <Dropdown
            trigger={<DropdownTrigger label="Style" activeCount={styleParams.length} />}
            options={filterOptions.style}
            multiple
            value={styleParams}
            onChange={handleFilterChange('styleId')}
          />
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => updateQueryString('page', page.toString())}
                />
              </div>
            )}
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
