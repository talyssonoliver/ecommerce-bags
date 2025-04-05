export interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductDBRow {
  id: number;
  name: string;
  description: string;
  price: number;
  inventory_count: number;
  category?: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
}

export interface ProductWithImageRow extends ProductDBRow {
  product_images: {
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
    product_id: number;
  }
}

export interface CheckoutProduct {
  id: number;
  name: string;
  price: number;
  inventory_count: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageId: string;
  rating: number;
  reviews: number;
  color: string;
  material: string;
  inStock: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}