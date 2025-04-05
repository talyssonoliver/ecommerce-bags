import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Product, ProductImage, CartItemWithProduct, InventoryError, CartSummary } from '@/types/cart';

// Create a Supabase server client
const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};

export class CartRepository {
  /**
   * Get or create a cart for the specified user or anonymous session
   */
  static async getOrCreateCart(userId?: string, anonymousCartId?: string): Promise<{ cartId: string, isNew: boolean }> {
    const supabase = await createClient();
    
    if (userId) {
      // Logged in user - use their ID
      const { data: existingCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (existingCart) {
        return { cartId: existingCart.id.toString(), isNew: false };
      } else {
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ user_id: userId, status: 'active' })
          .select('id')
          .single();
        
        if (error || !newCart) {
          throw new Error('Failed to create cart');
        }
        
        return { cartId: newCart.id.toString(), isNew: true };
      }
    } else if (anonymousCartId) {
      // Check if the anonymous cart exists
      const { data } = await supabase
        .from('carts')
        .select('id')
        .eq('id', anonymousCartId)
        .eq('status', 'active')
        .single();
      
      if (data) {
        return { cartId: anonymousCartId, isNew: false };
      }
    }
    
    // Create a new anonymous cart
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ status: 'active' })
      .select('id')
      .single();
    
    if (error || !newCart) {
      throw new Error('Failed to create anonymous cart');
    }
    
    return { cartId: newCart.id.toString(), isNew: true };
  }
  
  /**
   * Add item to cart or update quantity if already exists
   */
  static async addToCart(cartId: string, productId: number, quantity: number): Promise<void> {
    const supabase = await createClient();
    
    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      
      if (error) {
        throw new Error('Failed to update cart item');
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity,
        });
      
      if (error) {
        throw new Error('Failed to add item to cart');
      }
    }
  }
  
  /**
   * Get cart items with product details
   */
  static async getCart(cartId: string): Promise<CartSummary> {
    const supabase = await createClient();
    
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity')
      .eq('cart_id', cartId);
    
    if (cartError) {
      throw new Error('Failed to get cart items');
    }
    
    let total = 0;
    const items: CartItemWithProduct[] = [];
    
    // Get product details for each cart item
    for (const item of cartItems || []) {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, inventory_count, images(*)')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        const formattedImages = product.images.map((img: ProductImage) => ({
          id: img.id,
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary
        }));
        
        const formattedProduct: Product = {
          id: product.id,
          name: product.name,
          price: product.price,
          inventory_count: product.inventory_count,
          images: formattedImages
        };
        
        total += product.price * item.quantity;
        
        items.push({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: formattedProduct
        });
      }
    }
    
    return {
      items,
      total: parseFloat(total.toFixed(2)),
    };
  }
  
  /**
   * Check if a product has enough inventory
   */
  static async checkInventory(productId: number, requestedQuantity: number): Promise<{
    available: number,
    isAvailable: boolean,
    product: Product,
    error?: InventoryError,
    message?: string
  }> {
    const supabase = await createClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select('id, inventory_count, name')
      .eq('id', productId)
      .single();
    
    if (error || !product) {
      throw new Error('Product not found');
    }
    
    return {
      available: product.inventory_count,
      isAvailable: product.inventory_count >= requestedQuantity,
      product: product as Product,
    };
  }
  
  /**
   * Remove item from cart
   */
  static async removeItem(itemId: number): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      throw new Error('Failed to remove item from cart');
    }
  }
  
  /**
   * Update item quantity
   */
  static async updateItemQuantity(itemId: number, quantity: number): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
    
    if (error) {
      throw new Error('Failed to update item quantity');
    }
  }
  
  /**
   * Get user's active cart ID
   */
  static async getUserCartId(userId: string): Promise<string | null> {
    const supabase = await createClient();
    
    const { data } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    return data?.id?.toString() || null;
  }
  
  /**
   * Merge anonymous cart into user cart after login
   */
  static async mergeAnonymousCart(anonymousCartId: string, userId: string): Promise<string> {
    const supabase = await createClient();
    
    // Get or create user cart
    const { cartId: userCartId } = await this.getOrCreateCart(userId);
    
    // Get items from anonymous cart
    const { data: anonymousItems } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', anonymousCartId);
    
    if (anonymousItems && anonymousItems.length > 0) {
      // Add each anonymous item to user cart
      for (const item of anonymousItems) {
        await this.addToCart(userCartId, item.product_id, item.quantity);
      }
      
      // Delete anonymous cart items
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', anonymousCartId);
      
      // Mark anonymous cart as merged
      await supabase
        .from('carts')
        .update({ status: 'merged' })
        .eq('id', anonymousCartId);
    }
    
    return userCartId;
  }
}