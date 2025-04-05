import { stripe, formatAmountForStripe } from '@/lib/stripe/client';
import { OrderRepository } from '@/lib/repositories/orderRepository';
import { CartRepository } from '@/lib/repositories/cartRepository';
import { CustomerRepository } from '@/lib/repositories/customerRepository';
import { ProductRepository } from '@/lib/repositories/productRepository';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CartItem, CartSummary } from '@/types/cart';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import Stripe from 'stripe';

interface CustomerData {
  email: string;
  name: string;
  phone?: string;
  userId?: string;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

interface CheckoutResult {
  success: boolean;
  error?: string;
  orderId?: string;
  url?: string;
  session_id?: string;
  total?: number;
  inventoryErrors?: InventoryError[];
}

interface InventoryError {
  product_id: number;
  name: string;
  requested: number;
  available: number;
}

export async function processCheckout(
  customerData: CustomerData, 
  cookieStore: ReadonlyRequestCookies
): Promise<CheckoutResult> {
  try {
    // 1. Create or update customer
    const { customerId, success: customerSuccess, error: customerError } = 
      await CustomerRepository.upsertCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone || null,
        address: customerData.shipping_address
      });
    
    if (!customerSuccess) {
      return { success: false, error: customerError || 'Failed to create customer record' };
    }
    
    // 2. Get cart items
    const anonymousCartId = cookieStore.get('anonymous_cart_id')?.value;
    let cartId = null;
    
    if (customerData.userId) {
      // For logged-in users
      cartId = await CartRepository.getUserCartId(customerData.userId);
    } else if (anonymousCartId) {
      // For anonymous users
      cartId = anonymousCartId;
    }
    
    if (!cartId) {
      return { success: false, error: 'No active cart found' };
    }
    
    // 3. Get cart with items
    const cart = await CartRepository.getCart(cartId);
    
    if (!cart.items.length) {
      return { success: false, error: 'Cart is empty' };
    }
    
    // 4. Validate inventory and create order
    const { valid, errors } = await validateInventory(cart.items);
    
    if (!valid) {
      return { 
        success: false, 
        error: 'Inventory validation failed',
        inventoryErrors: errors
      };
    }
    
    // 5. Create order
    const { orderId, success: orderSuccess, error: orderError } = 
      await OrderRepository.createOrderFromCart(
        customerId!,
        cart,
        customerData.shipping_address
      );
    
    if (!orderSuccess) {
      return { success: false, error: orderError || 'Failed to create order' };
    }
    
    // 6. Create Stripe checkout session
    const { url, session_id, error: stripeError } = 
      await createStripeCheckoutSession(customerData, cart, orderId!);
    
    if (stripeError) {
      return { success: false, error: stripeError };
    }
    
    // 7. Update inventory
    await updateInventoryForItems(cart.items);
    
    // 8. Clear cart after successful checkout
    if (cartId) {
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
      
      // For anonymous carts, mark them as completed
      if (anonymousCartId) {
        await supabaseAdmin
          .from('carts')
          .update({ status: 'completed' })
          .eq('id', anonymousCartId);
      }
    }
    
    return {
      success: true,
      orderId,
      url,
      session_id,
      total: cart.total
    };
  } catch (error) {
    console.error('Checkout process failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during checkout'
    };
  }
}

// Helper function to validate inventory
async function validateInventory(
  items: CartItem[]
): Promise<{ valid: boolean; errors: InventoryError[] }> {
  const errors: InventoryError[] = [];
  
  for (const item of items) {
    const check = await ProductRepository.checkInventory(item.product_id, item.quantity);
    
    if (!check.isAvailable) {
      errors.push({
        product_id: item.product_id,
        name: check.product?.name || 'Unknown product',
        requested: item.quantity,
        available: check.available
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to create Stripe checkout session
async function createStripeCheckoutSession(
  customerData: CustomerData,
  cart: CartSummary,
  orderId: string
): Promise<{ url?: string; session_id?: string; error?: string }> {
  try {
    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.product.name,
          images: item.product.images
            .filter(img => img.is_primary && img.url)
            .map(img => img.url) as string[],
        },
        unit_amount: formatAmountForStripe(item.product.price, 'gbp'),
      },
      quantity: item.quantity,
    }));
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerData.email,
      client_reference_id: orderId,
      metadata: {
        order_id: orderId,
        customer_id: customerData.userId || 'guest'
      },
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping for now
              currency: 'gbp',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    });
    
    // Update order with payment intent ID if available
    if (session.payment_intent) {
      await supabaseAdmin
        .from('orders')
        .update({ payment_intent_id: session.payment_intent.toString() })
        .eq('id', orderId);
    }
    
    return {
      url: session.url || undefined,
      session_id: session.id
    };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session'
    };
  }
}

// Helper function to update inventory for multiple items
async function updateInventoryForItems(items: CartItem[]): Promise<void> {
  for (const item of items) {
    await ProductRepository.decrementInventory(item.product_id, item.quantity);
  }
}

// Export utility functions for testing or direct use
export { validateInventory, createStripeCheckoutSession, updateInventoryForItems };