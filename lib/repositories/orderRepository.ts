import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { CartSummary } from '@/types/cart';

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

export class OrderRepository {
  /**
   * Create a new order from cart items
   */
  static async createOrderFromCart(
    userId: string,
    cartItems: CartSummary,
    shippingAddress: string
  ): Promise<{ orderId: string; success: boolean; error?: string }> {
    const supabase = await createClient();
    
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total: cartItems.total,
          shipping_address: shippingAddress,
        })
        .select('id')
        .single();
        
      if (orderError || !order) {
        throw new Error('Failed to create order');
      }
      
      // Create order items
      const orderItems = cartItems.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        throw new Error('Failed to create order items');
      }
      
      return { 
        orderId: order.id,
        success: true 
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        orderId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Additional methods can be added as needed
}
