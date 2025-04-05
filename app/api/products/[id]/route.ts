import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/services/productService';

interface RequestParams {
    params: {
        id: string;
    }
}

export async function GET(
    request: NextRequest, 
    { params }: RequestParams
): Promise<NextResponse> {
    try {
        const { id } = params;
        
        // Validate UUID format
        const uuidSchema = z.string().uuid();
        try {
            uuidSchema.parse(id);
        } catch (error) {
            console.error('UUID validation failed:', error);
            // Use the error to provide better feedback
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors.map(e => e.message).join(', ');
                return NextResponse.json(
                    { error: `Invalid product ID format: ${errorMessage}` },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Invalid product ID format' },
                { status: 400 }
            );
        }
        
        // Get product from service instead of direct database call
        const product = await getProduct(id);
        
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(product);
    } catch (error) {
        console.error('API error:', error);
        
        if (error instanceof Error && error.message === 'Product not found') {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}