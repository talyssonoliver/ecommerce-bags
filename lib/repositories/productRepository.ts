import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string | null;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
}

export class ProductRepository {
  /**
   * Get products with filtering, sorting and pagination
   */
  static async getProducts({ 
    page = 1, 
    limit = 12, 
    category = null, 
    sort = 'newest' 
  }: ProductQueryParams) {
    const supabase = await createClient();
    
    let query = supabase
      .from('products')
      .select('*, product_images(*)', { count: 'exact' });
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
    
    return { 
      products: data, 
      meta: {
        total: count ?? 0,
        page,
        limit,
        pages: Math.ceil((count ?? 0) / limit)
      }
    };
  }

  /**
   * Get a product by ID
   */
  static async getProductById(productId: string | number) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('id', productId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Product not found');
      }
      throw new Error(`Failed to get product: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Update product inventory (for admin or checkout)
   */
  static async updateProductInventory(productId: string | number, quantity: number) {
    // Only for admin use or checkout process
    const { data, error } = await supabaseAdmin
      .rpc('update_product_inventory', { 
        product_id: productId, 
        quantity_change: -quantity // negative because we're decreasing inventory
      });
    
    if (error) {
      throw new Error(`Error updating inventory: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Check if a product has sufficient inventory
   */
  static async checkInventory(productId: number, quantity: number) {
    const supabase = await createClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, inventory_count')
      .eq('id', productId)
      .single();
    
    if (error) {
      throw new Error(`Failed to check inventory: ${error.message}`);
    }
    
    return {
      available: product.inventory_count,
      isAvailable: product.inventory_count >= quantity,
      product
    };
  }
  
  /**
   * Decrement inventory for a product
   */
  static async decrementInventory(productId: number, quantity: number): Promise<void> {
    try {
      // Get current inventory count
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('inventory_count')
        .eq('id', productId)
        .single();
      
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      
      // Calculate new inventory count (never go below zero)
      const newCount = Math.max(0, product.inventory_count - quantity);
      
      // Update the inventory
      const { error } = await supabaseAdmin
        .from('products')
        .update({ inventory_count: newCount })
        .eq('id', productId);
      
      if (error) {
        throw new Error(`Failed to update inventory: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error updating inventory for product ${productId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 4) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get featured products: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Search products
   */
  static async searchProducts(query: string, limit = 10) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
    
    return data;
  }
}