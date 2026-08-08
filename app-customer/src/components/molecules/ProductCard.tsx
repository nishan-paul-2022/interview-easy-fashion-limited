import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export interface ProductCardProps {
  id?: string;
  name?: string;
  category?: string;
  styleName?: string;
  sizes?: string[];
  price?: number;
  imageUrl?: string;
  onAddToCart?: (id: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id = 'prd_01',
  name = 'Classic Oxford Button-Down Shirt',
  category = 'Shirts',
  styleName = 'Casual',
  sizes = ['S', 'M', 'L', 'XL'],
  price = 49.99,
  imageUrl = 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=600',
  onAddToCart,
  className = '',
}) => {
  return (
    <div
      className={`group relative flex flex-col bg-surface border border-muted/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 ${className}`}
    >
      <Link href={`/products/${id}`} className="block flex-grow flex flex-col">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/10">
          <Image
            src={imageUrl}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
            {sizes.map((size) => (
              <Badge key={size} label={size} variant="neutral" />
            ))}
          </div>
        </div>

        <div className="flex flex-col p-4 flex-grow">
          <div className="text-xs text-muted mb-1 flex items-center justify-between uppercase tracking-wider">
            <span>{category}</span>
            <span>{styleName}</span>
          </div>

          <h3 className="text-text font-medium text-lg leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {name}
          </h3>
        </div>
      </Link>

      <div className="px-4 pb-4 mt-auto">
        <div className="pt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-2 border-t border-muted/10">
          <span className="text-xl font-bold text-accent">${price.toFixed(2)}</span>
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.(id);
            }}
            leftIcon="ShoppingBag"
            className="w-full xl:w-auto justify-center"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
