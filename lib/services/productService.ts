import { ProductRepository } from '../repositories/productRepository';
import { Product, ProductsResponse } from '@/types/product';

/**
 * List products with optional filtering and pagination
 * @param queryParams - Filter and pagination parameters
 * @returns ProductsResponse with products array and pagination metadata
 */
export async function listProducts(queryParams: {
  page?: number;
  limit?: number;
  category?: string | null;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}): Promise<ProductsResponse> {
  try {
    const result = await ProductRepository.getProducts(queryParams);
    return {
      products: result.products,
      pagination: {
        total: result.meta.total,
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalPages: result.meta.pages,
      }
    };
  } catch (error) {
    console.error('Error listing products:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to list products');
  }
}

/**
 * Get a single product by ID
 * @param id - Product ID
 * @returns Product object
 * @throws Error if product not found
 */
export async function getProduct(id: string): Promise<Product> {
  try {
    const product = await ProductRepository.getProductById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    console.error(`Error getting product ${id}:`, error);
    throw error instanceof Error ? error : new Error('Failed to get product');
  }
}

/**
 * Check if a product has sufficient inventory
 * @param productId - Product ID
 * @param quantity - Requested quantity
 * @returns Inventory availability information
 */
export async function checkProductInventory(productId: number, quantity: number) {
  try {
    return await ProductRepository.checkInventory(productId, quantity);
  } catch (error) {
    console.error(`Error checking inventory for product ${productId}:`, error);
    throw new Error('Failed to check product inventory');
  }
}

/**
 * Get featured products for homepage or special sections
 * @param limit - Maximum number of products to return
 * @returns Array of featured products
 */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    return await ProductRepository.getFeaturedProducts(limit);
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw new Error('Failed to get featured products');
  }
}