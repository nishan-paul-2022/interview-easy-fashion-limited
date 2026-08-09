'use client';

import { Carousel } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { ProductCardProps, ProductCard } from '@/components/molecules/ProductCard';
import { ProductGridSkeleton } from '@/components/molecules/Skeleton';
import { useToast } from '@/components/molecules/Toast';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/api';

interface StatsResponse {
  totalCategories?: number;
  totalProducts?: number;
  totalSizes?: number;
  totalStyles?: number;
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

interface CategoryResponse {
  id: string | number;
  name: string;
  imageUrl?: string;
}

interface PaginatedResponse<T> {
  data: T[];
}

interface FormattedCategory {
  name: string;
  url: string;
  image: string;
}

export default function Home() {
  const { dispatch } = useCart();
  const { success } = useToast();

  const [stats, setStats] = useState([
    { title: 'Total Categories', value: '-', icon: 'Folder' as const },
    { title: 'Total Products', value: '-', icon: 'Package' as const },
    { title: 'Available Sizes', value: '-', icon: 'Ruler' as const },
    { title: 'Available Styles', value: '-', icon: 'Palette' as const },
  ]);

  const [featuredProducts, setFeaturedProducts] = useState<ProductCardProps[]>([]);
  const [categories, setCategories] = useState<FormattedCategory[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const handleAddToCart = (id: string) => {
    const product = featuredProducts.find((p) => p.id === id);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, productsData, categoriesData] = await Promise.all([
          apiClient.get<StatsResponse>('/stats/summary').catch(() => null),
          apiClient
            .get<PaginatedResponse<ProductResponse>>('/products', { limit: 6 })
            .catch(() => ({ data: [] })),
          apiClient
            .get<PaginatedResponse<CategoryResponse>>('/categories')
            .catch(() => ({ data: [] })),
        ]);

        if (statsData) {
          setStats([
            {
              title: 'Total Categories',
              value: String(statsData.totalCategories || 0),
              icon: 'Folder',
            },
            {
              title: 'Total Products',
              value: String(statsData.totalProducts || 0),
              icon: 'Package',
            },
            { title: 'Available Sizes', value: String(statsData.totalSizes || 0), icon: 'Ruler' },
            {
              title: 'Available Styles',
              value: String(statsData.totalStyles || 0),
              icon: 'Palette',
            },
          ]);
        }

        if (productsData?.data) {
          const formattedProducts: ProductCardProps[] = productsData.data.map((p) => ({
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
              'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=600',
          }));
          setFeaturedProducts(formattedProducts);
        }

        if (categoriesData?.data) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const categoryImages: Record<string, string> = {
            Tops: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260309/easy-fashion-categories/tops.jpg`,
            Jeans: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260309/easy-fashion-categories/jeans.jpg`,
            Outerwear: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260310/easy-fashion-categories/outerwear.jpg`,
            Footwear: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260311/easy-fashion-categories/footwear.jpg`,
            Accessories: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260311/easy-fashion-categories/accessories.jpg`,
            Activewear: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260312/easy-fashion-categories/activewear.jpg`,
            'Suits & Formal': `https://res.cloudinary.com/${cloudName}/image/upload/v1786260313/easy-fashion-categories/suits-formal.jpg`,
            Dresses: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260314/easy-fashion-categories/dresses.jpg`,
            Sleepwear: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260314/easy-fashion-categories/sleepwear.jpg`,
            Hats: `https://res.cloudinary.com/${cloudName}/image/upload/v1786260315/easy-fashion-categories/hats.jpg`,
          };
          const formattedCategories: FormattedCategory[] = categoriesData.data.map((c) => ({
            name: c.name,
            url: `/products?categoryId=${c.id}`,
            image:
              categoryImages[c.name] ||
              'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=600',
          }));
          setCategories(formattedCategories);
        }
      } catch {
        // Ignored empty catch to satisfy empty block rules without throwing
        console.error('Failed to fetch home page data');
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="w-full rounded-lg overflow-hidden relative">
        <Carousel autoplay effect="fade">
          <div className="relative min-h-96 md:min-h-screen w-full">
            <div className="absolute inset-0 bg-black/60 z-10" />

            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200"
              alt="Fashion 1"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Summer Collection 2026
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                Discover the latest trends in modern fashion. High quality, responsive styles for
                everyone.
              </p>
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative min-h-96 md:min-h-screen w-full">
            <div className="absolute inset-0 bg-black/60 z-10" />

            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200"
              alt="Fashion 2"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Elevate Your Style</h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                Minimalist designs with a focus on comfort and durability.
              </p>
              <Link href="/products">
                <Button variant="primary" size="lg">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </Carousel>
      </section>

      {/* Summary Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface rounded-lg p-6 border border-muted/20 flex items-center gap-4 hover:border-accent transition-colors"
          >
            <div className="p-3 bg-bg rounded-full text-accent flex-shrink-0">
              <Icon name={stat.icon} size={24} />
            </div>
            <div>
              <p className="text-muted text-sm">{stat.title}</p>
              <p className="text-text text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text">Featured Products</h2>
          <Link href="/products" className="text-accent hover:underline text-sm font-medium">
            View All
          </Link>
        </div>
        {isLoadingProducts ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Preview */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-text">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={cat.url}
              className="group block relative h-64 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />

              <Image
                src={cat.image}
                alt={cat.name}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white tracking-wider">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
