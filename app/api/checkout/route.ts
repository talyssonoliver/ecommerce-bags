import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { rateLimit } from '@/lib/utils/rate-limit';
import { CartItem } from '@/types/cart';
import { CheckoutProduct } from '@/types/product';
import { InventoryErrorResponse } from '@/types/error';

// Validation schema for customer data
const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().optional(),
  shipping_address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    postal_code: z.string().min(4),
    country: z.string().min(2)
  })
});

// POST /api/checkout - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const limiter = await rateLimit(request, 15, '10 minutes');
    
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Validate customer data
    const customer = customerSchema.parse(body);
    
    // Get supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    
    // Get session data
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get cart items from session or cookies
    let cartItems = [];
    if (session && session.user.user_metadata.cart) {
      cartItems = session.user.user_metadata.cart.items || [];
    } else {
      // Get cart from cookies
      const cartCookie = cookieStore.get('cart');
      if (cartCookie) {
        try {
          const cartData = JSON.parse(cartCookie.value);
          cartItems = cartData.items || [];
        } catch (error) {
          console.error('Error parsing cart cookie:', error);
        }
      }
    }
    
    // Validate cart not empty
    if (!cartItems.length) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Fetch products data to calculate prices
    // Extract product IDs from cart items
    const productIds: number[] = (cartItems as CartItem[]).map((item: CartItem) => item.product_id);
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, inventory_count')
      .in('id', productIds);
      
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product details' },
        { status: 500 }
      );
    }
    
    // Validate inventory and build line items for Stripe
    const lineItems = [];
    const inventoryErrors = [];
    
    // Fix: Use the explicit CartItem interface for all cart item references
    for (const item of cartItems as CartItem[]) {
      // Use CheckoutProduct instead of ProductDBRow
      const product = products.find((p: CheckoutProduct) => p.id === Number(item.product_id));
      
      if (!product) {
        inventoryErrors.push({
          product_id: item.product_id,
          error: 'Product not found'
        });
        continue;
      }
      
      if (product.inventory_count < item.quantity) {
        inventoryErrors.push({
          product_id: item.product_id,
          name: product.name,
          requested: item.quantity,
          available: product.inventory_count,
          error: 'Insufficient inventory'
        });
        continue;
      }
      
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents/pence
        },
        quantity: item.quantity,
      });
    }
    
    // When returning inventory errors, use the standardized response format
    if (inventoryErrors.length > 0) {
      const response: InventoryErrorResponse = { errors: inventoryErrors };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Store or update customer data in database
    let customerId;
    
    if (session) {
      // For logged in users, link to their account
      customerId = session.user.id;
      
      // Update user's customer record
      const { error: customerUpdateError } = await supabaseAdmin
        .from('customers')
        .upsert({
          id: customerId,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.shipping_address
        }, { onConflict: 'id' });
        
      if (customerUpdateError) {
        console.error('Error updating customer:', customerUpdateError);
        return NextResponse.json(
          { error: 'Failed to update customer data' },
          { status: 500 }
        );
      }
    } else {
      // For guest checkout, create a new customer record
      const { data: newCustomer, error: customerCreateError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.shipping_address
        })
        .select('id')
        .single();
        
      if (customerCreateError) {
        console.error('Error creating customer:', customerCreateError);
        return NextResponse.json(
          { error: 'Failed to create customer record' },
          { status: 500 }
        );
      }
      
      customerId = newCustomer.id;
    }
    
    // Calculate order total for database record
    const orderTotal = cartItems.reduce((total: number, item: CartItem) => {
      // Use CheckoutProduct instead of ProductDBRow
      const product = products.find((p: CheckoutProduct) => p.id === Number(item.product_id));
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    
    // Create pending order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        total_amount: orderTotal,
        shipping_address: customer.shipping_address
      })
      .select('id')
      .single();
      
    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    // Create order items
    const orderItems = cartItems.map((item: CartItem) => {
      // Use CheckoutProduct instead of ProductDBRow
      const product = products.find((p: CheckoutProduct) => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product ? product.price : 0
      };
    });
    
    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
      
    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      // Don't fail the checkout, but log the error
    }
    
    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      client_reference_id: order.id, // Link to our order ID
      metadata: {
        order_id: order.id,
        customer_id: customerId
      },
      shipping_address_collection: {
        allowed_countries: ['GB'], // United Kingdom only for MVP
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping for MVP
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmacao?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
    });
    
    // Update order with payment intent ID
    await supabaseAdmin
      .from('orders')
      .update({
        payment_intent_id: checkoutSession.payment_intent
      })
      .eq('id', order.id);
    
    // Return checkout session URL
    return NextResponse.json({ 
      url: checkoutSession.url,
      session_id: checkoutSession.id,
      order_id: order.id
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isZodError = error instanceof Error && error.name === 'ZodError';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: isZodError ? 400 : 500 }
    );
  }
}