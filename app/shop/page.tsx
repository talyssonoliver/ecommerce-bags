import React from 'react';

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Our Collection</h1>
      <p className="text-xl mb-8">Browse our premium designer bags</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="h-60 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-medium text-lg">Designer Bag {item}</h3>
              <p className="text-gray-600 mt-1">${(199 + item * 10).toFixed(2)}</p>
              <button className="mt-3 w-full py-2 bg-black text-white rounded">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
