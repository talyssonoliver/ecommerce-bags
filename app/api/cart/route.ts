import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Product, CartItemWithProduct, ProductImage } from '@/types/cart';
import { InventoryError } from '@/types/error';
import { SupabaseClient } from '@supabase/supabase-js';

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

// Schema for add to cart request
const addToCartSchema = z.object({
  product_id: z.number(),
  quantity: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get user_id from session or use anonymous cart id from cookie
    const userId = session?.user?.id;
    const body = await request.json();
    
    // Validate request data
    const validationResult = addToCartSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    const { product_id, quantity } = validationResult.data;
    
    // Check product inventory
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, inventory_count, name')
      .eq('id', product_id)
      .single();
    
    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Validate inventory
    if (product.inventory_count < quantity) {
      const inventoryError: InventoryError = {
        product_id: product_id,
        name: product.name,
        requested: quantity,
        available: product.inventory_count,
        error : 'Not enough inventory'
      };
      
      return NextResponse.json({
        error: 'Not enough inventory',
        inventory: inventoryError
      }, { status: 400 });
    }
    
    let cartId: string | null = null;
    
    // Get or create cart
    if (userId) {
      // Logged in user - use their ID
      const { data: existingCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (existingCart) {
        cartId = existingCart.id.toString();
      } else {
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert({ user_id: userId, status: 'active' })
          .select('id')
          .single();
        
        if (newCartError || !newCart) {
          return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
        }
        cartId = newCart.id.toString();
      }
    } else {
      // Anonymous cart - use cookie
      cartId = request.cookies.get('anonymous_cart_id')?.value || null;
      
      if (!cartId) {
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert({ status: 'active' })
          .select('id')
          .single();
        
        if (newCartError || !newCart) {
          return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
        }
        
        cartId = newCart.id.toString();
        
        // Set cookie - 
        const response = NextResponse.next();
        if (typeof cartId === 'string') { // Added check to ensure cartId is string
          response.cookies.set('anonymous_cart_id', cartId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }
    }
    
    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .single();
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check inventory again with new total
      if (product.inventory_count < newQuantity) {
        const inventoryError: InventoryError = {
          product_id: product_id,
          name: product.name,
          requested: newQuantity,
          available: product.inventory_count,
          error: 'Not enough inventory'
        };
        
        return NextResponse.json({
          error: 'Not enough inventory',
          inventory: inventoryError
        }, { status: 400 });
      }
      
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      
      if (updateError) {
        const errorMessage = typeof updateError === 'object' && updateError !== null 
          ? (updateError as Error).message || 'Database error'
          : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id,
          quantity,
        });
      
      if (insertError) {
        const errorMessage = typeof insertError === 'object' && insertError !== null 
          ? (insertError as Error).message || 'Database error'
          : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }
    
    // Get updated cart with products
    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
    }
    const response = await getCartResponse(cartId, supabase);
    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    const errorMessage = typeof error === 'object' && error !== null 
      ? (error as Error).message || 'Server error'
      : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get user_id from session or use anonymous cart id from cookie
    const userId = session?.user?.id;
    let cartId: string | null = null;
    
    if (userId) {
      // Logged in user - get their active cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      cartId = cart?.id?.toString() || null;
    } else {
      // Anonymous user - get cart from cookie
      const cookieStore = await cookies();
      const anonymousCartId = cookieStore.get('anonymous_cart_id')?.value || null;
      cartId = anonymousCartId;
    }
    
    if (!cartId) {
      // No cart found, return empty cart
      return NextResponse.json({
        items: [],
        total: 0,
      });
    }
    
    return await getCartResponse(cartId, supabase);
  } catch (error) {
    console.error('Error getting cart:', error);
    const errorMessage = typeof error === 'object' && error !== null 
      ? (error as Error).message || 'Server error'
      : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Helper function to get cart with products
async function getCartResponse(cartId: string, supabase: SupabaseClient) {
  // Fix: Ensure cartId is not null
  if (!cartId) {
    return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
  }
  
  // Fix: Ensure cartId is always a string to fix Type error
  const safeCartId = String(cartId);
  
  // Get cart items with product details
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity')
    .eq('cart_id', safeCartId);
  
  if (cartError) {
    return NextResponse.json({ error: 'Failed to get cart items' }, { status: 500 });
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
  
  return NextResponse.json({
    items,
    total: parseFloat(total.toFixed(2)),
  });
}

// Remove item from cart or update quantity
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', parseInt(itemId, 10));
    
    if (deleteError) {
      const errorMessage = typeof deleteError === 'object' && deleteError !== null 
        ? (deleteError as Error).message || 'Database error'
        : 'Unknown error';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    const errorMessage = typeof error === 'object' && error !== null 
      ? (error as Error).message || 'Server error'
      : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}