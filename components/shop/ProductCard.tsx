"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProductImage {
  url: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: ProductImage[];
    category: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    // This would be replaced with actual cart logic
    console.log('Adding to cart:', product.id);
  };
  
  return (
    <Card className="h-full transition-all duration-300 group">
      <Link href={`/produtos/${product.id}`} className="flex flex-col h-full">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-card">
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt_text}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="mb-2 text-heading-small">{product.name}</h3>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-semibold">{formatCurrency(product.price)}</span>
            <Button 
              variant="secondary" // Changed from "outline" to "secondary"
              size="sm"
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;