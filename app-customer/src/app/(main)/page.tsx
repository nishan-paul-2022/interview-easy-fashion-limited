'use client';

import { Carousel } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { ProductCard } from '@/components/molecules/ProductCard';

export default function Home() {
  const stats = [
    { title: 'Total Categories', value: '12', icon: 'Folder' as const },
    { title: 'Total Products', value: '150+', icon: 'Package' as const },
    { title: 'Available Sizes', value: '8', icon: 'Ruler' as const },
    { title: 'Available Styles', value: '24', icon: 'Palette' as const },
  ];

  const featuredProducts = [
    {
      id: '1',
      name: 'Classic White Tee',
      category: 'T-Shirts',
      styleName: 'Casual',
      sizes: ['S', 'M', 'L'],
      price: 29.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '2',
      name: 'Denim Jacket',
      category: 'Jackets',
      styleName: 'Streetwear',
      sizes: ['M', 'L', 'XL'],
      price: 89.99,
      imageUrl:
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '3',
      name: 'Slim Fit Chinos',
      category: 'Pants',
      styleName: 'Smart Casual',
      sizes: ['30', '32', '34'],
      price: 59.99,
      imageUrl:
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: '4',
      name: 'Canvas Sneakers',
      category: 'Shoes',
      styleName: 'Casual',
      sizes: ['8', '9', '10', '11'],
      price: 45.0,
      imageUrl:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const categories = [
    {
      name: 'Shirts',
      url: '/products?category=Shirts',
      image:
        'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Pants',
      url: '/products?category=Pants',
      image:
        'https://images.unsplash.com/photo-1624378439575-d1ead6cb2d9e?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Jackets',
      url: '/products?category=Jackets',
      image:
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Accessories',
      url: '/products?category=Accessories',
      image:
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600',
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="w-full rounded-lg overflow-hidden relative">
        <Carousel autoplay effect="fade">
          <div className="relative h-[400px] md:h-[500px] w-full">
            <div className="absolute inset-0 bg-black/40 z-10" />

            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200"
              alt="Fashion 1"
              fill
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
          <div className="relative h-[400px] md:h-[500px] w-full">
            <div className="absolute inset-0 bg-black/40 z-10" />

            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200"
              alt="Fashion 2"
              fill
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
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
