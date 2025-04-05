import React from 'react';
import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-5 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
