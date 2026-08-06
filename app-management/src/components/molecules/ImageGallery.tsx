'use client';

import React, { useState } from 'react';

export interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-muted/20 border border-muted/20">
        <span className="text-muted">No images available</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-muted/20 bg-surface">
        <img
          src={images[activeIndex]}
          alt={`Product view ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 ${
                index === activeIndex ? 'border-accent' : 'border-transparent hover:border-muted/50'
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
