import { InventoryError } from './error';

declare namespace Cart {
  interface CartItem {
    product_id: number;
    quantity: number;
    id?: number;
  }

  interface Product {
    id: number;
    name: string;
    price: number;
    inventory_count: number;
    images: ProductImage[];
  }

  interface ProductImage {
    id: number;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }

  interface CartItemWithProduct extends CartItem {
    product: Product;
  }

  interface CartSummary {
    items: CartItemWithProduct[];
    total: number;
  }
}

// Export the Cart namespace types for direct import
export type CartItem = Cart.CartItem;
export type Product = Cart.Product;
export type ProductImage = Cart.ProductImage;
export type CartItemWithProduct = Cart.CartItemWithProduct;
export type CartSummary = Cart.CartSummary;

// Re-export the imported InventoryError type from error.d.ts
export { InventoryError };