import { CartRepository } from '@/lib/repositories/cartRepository';
import { CartItemWithProduct, InventoryError, CartSummary } from '@/types/cart';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function getCartFromCookies(cookieStore: ReadonlyRequestCookies): Promise<CartSummary> {
  // Get anonymous cart ID from cookies
  const anonymousCartId = cookieStore.get('anonymous_cart_id')?.value;
  
  if (!anonymousCartId) {
    // Return empty cart if no cart ID found in cookies
    return { items: [], total: 0 };
  }
  
  try {
    // Get cart from repository
    return await CartRepository.getCart(anonymousCartId);
  } catch (error) {
    console.error('Error getting cart from cookies:', error);
    // Return empty cart on error
    return { items: [], total: 0 };
  }
}

export async function addToCart(
  cartId: string, 
  productId: number, 
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await CartRepository.addToCart(cartId, productId, quantity);
    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function validateCartInventory(
  items: CartItemWithProduct[]
): Promise<{ valid: boolean; errors: InventoryError[] }> {
  const inventoryErrors: InventoryError[] = [];
  
  for (const item of items) {
    try {
      // Check inventory with repository
      const { isAvailable, available, product } = await CartRepository.checkInventory(
        item.product_id, 
        item.quantity
      );
      
      if (!isAvailable) {
        inventoryErrors.push({
          product_id: item.product_id,
          name: product.name,
          requested: item.quantity,
          available: available
        });
      }
    } catch (error) {
      console.error(`Error checking inventory for product ${item.product_id}:`, error);
      
      // Add a generic error for this product
      inventoryErrors.push({
        product_id: item.product_id,
        name: item.product?.name || 'Unknown product',
        requested: item.quantity,
        available: 0
      });
    }
  }
  
  return {
    valid: inventoryErrors.length === 0,
    errors: inventoryErrors
  };
}

export async function removeFromCart(
  itemId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await CartRepository.removeItem(itemId);
    return { success: true };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function updateCartItemQuantity(
  itemId: number, 
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await CartRepository.updateItemQuantity(itemId, quantity);
    return { success: true };
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}