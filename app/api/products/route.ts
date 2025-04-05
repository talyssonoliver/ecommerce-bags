import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/utils/rate-limit';
import { ProductDBRow, ProductWithImageRow } from '@/types/product';

// Validation schema for product queries
const querySchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(12),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional().default('newest')
});

// GET /api/products - List products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const limiter = await rateLimit(request, 60, '10 minutes');
    
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedParams = querySchema.parse(params);
    const { category, page, limit, sort } = validatedParams;
    
    // Build the query
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        product_images!inner(*)
      `, { count: 'exact' });
    
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
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Format the data for the response
    const formattedData = data.reduce((acc: ProductDBRow[], item: ProductWithImageRow) => {
      const existingProduct = acc.find(p => p.id === item.id);
      
      if (existingProduct) {
        if (!existingProduct.images) existingProduct.images = [];
        existingProduct.images.push({
          id: item.product_images.id,
          url: item.product_images.url,
          alt_text: item.product_images.alt_text,
          is_primary: item.product_images.is_primary
        });
      } else {
        acc.push({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          inventory_count: item.inventory_count,
          category: item.category,
          created_at: item.created_at,
          updated_at: item.updated_at,
          images: [{
            id: item.product_images.id,
            url: item.product_images.url,
            alt_text: item.product_images.alt_text,
            is_primary: item.product_images.is_primary
          }]
        });
      }
      
      return acc;
    }, []);
    
    // Return the response
    return NextResponse.json({
      products: formattedData,
      meta: {
        total: count ?? 0,
        page,
        limit,
        pages: Math.ceil((count ?? 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}