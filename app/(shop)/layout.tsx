import React from 'react';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Shop header could go here */}
      <main>{children}</main>
      {/* Shop footer could go here */}
    </div>
  );
}
