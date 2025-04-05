"use client";

import { useEffect, useState } from 'react';
import CloudinaryImage from '@/components/CloudinaryImage';
import { Product } from '@/types/product';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductNotFound from '@/components/ProductNotFound';

// Mock function to fetch product data (replace with real API call later)
const fetchProduct = async (id: string): Promise<Product> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real implementation, you would fetch from an API
  // This is just mock data for demonstration
  const products: Record<string, Product> = {
    "1": {
      id: "1",
      name: "Classic Leather Tote",
      price: 99.99,
      description: "A timeless leather tote bag perfect for everyday use. Features a spacious interior with multiple pockets.",
      imageId: "ecommerce-bags/classic-tote",
      rating: 4.5,
      reviews: 128,
      color: "Brown",
      material: "Genuine Leather",
      inStock: true,
    },
    "2": {
      id: "2",
      name: "Canvas Backpack",
      price: 79.99,
      description: "Durable canvas backpack with padded laptop sleeve and adjustable straps for comfort.",
      imageId: "ecommerce-bags/canvas-backpack",
      rating: 4.2,
      reviews: 95,
      color: "Navy Blue",
      material: "Canvas",
      inStock: true,
    },
    // Add more mock products as needed
  };
  
  // If product not found, throw error
  if (!products[id]) {
    throw new Error("Product not found");
  }
  
  return products[id];
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProduct(params.id);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    getProductData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return <ProductNotFound message={error || "Product not found"} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <CloudinaryImage
            src={product.imageId || "ecommerce-bags/placeholder"}
            alt={product.name}
            width={600}
            height={600}
            className="rounded-lg shadow-md"
          />
          {!product.inStock && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              Out of Stock
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          <p className="text-2xl font-semibold mt-4">${product.price.toFixed(2)}</p>
          <div className="mt-4">
            <span className="font-medium">Color:</span> {product.color}
          </div>
          <div className="mt-2">
            <span className="font-medium">Material:</span> {product.material}
          </div>
          <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <select 
                id="quantity" 
                className="border rounded px-2 py-1"
                defaultValue="1"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i+1}>{i+1}</option>
                ))}
              </select>
            </div>
            <button 
              className={`w-full py-3 rounded-lg font-medium ${
                product.inStock 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-gray-400 text-gray-100 cursor-not-allowed"
              }`}
              disabled={!product.inStock}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
