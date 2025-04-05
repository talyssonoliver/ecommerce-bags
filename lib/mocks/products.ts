// src/lib/mocks/products.ts
import { Product, ProductsResponse } from '../../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Handcrafted Leather Tote Bag',
    description: 'A beautiful handcrafted leather tote bag made by skilled artisans in Brazil using traditional techniques.',
    price: 149.99,
    inventory_count: 10,
    category: 'tote',
    created_at: '2025-03-15T12:00:00Z',
    updated_at: '2025-03-15T12:00:00Z',
    images: [
      {
        id: '101',
        url: '/images/products/tote-1-main.jpg',
        alt_text: 'Brown leather tote bag front view',
        is_primary: true,
      },
      {
        id: '102',
        url: '/images/products/tote-1-angle.jpg',
        alt_text: 'Brown leather tote bag angle view',
        is_primary: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Colorful Woven Clutch',
    description: 'A vibrant clutch woven with colorful threads inspired by Brazilian cultural patterns.',
    price: 89.99,
    inventory_count: 15,
    category: 'clutch',
    created_at: '2025-03-10T10:30:00Z',
    updated_at: '2025-03-10T10:30:00Z',
    images: [
      {
        id: '201',
        url: '/images/products/clutch-1-main.jpg',
        alt_text: 'Colorful woven clutch front view',
        is_primary: true,
      },
    ],
  },
  // More mock products...
];

export function getMockProductsResponse(params: {
  page?: number;
  limit?: number;
  category?: string;
}): ProductsResponse {
  const { page = 1, limit = 12, category } = params;
  
  let filteredProducts = mockProducts;
  
  if (category) {
    filteredProducts = mockProducts.filter(p => p.category === category);
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedProducts = filteredProducts.slice(start, end);
  
  return {
    products: paginatedProducts,
    meta: {
      total: filteredProducts.length,
      page,
      limit,
      pages: Math.ceil(filteredProducts.length / limit),
    },
  };
}

export function getMockProduct(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}