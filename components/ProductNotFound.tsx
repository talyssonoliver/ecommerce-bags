import Link from 'next/link';

export default function ProductNotFound({ message = "Product not found" }: { message?: string }) {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        <p className="text-gray-600 mb-8">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Browse All Products
        </Link>
      </div>
    </div>
  );
}
