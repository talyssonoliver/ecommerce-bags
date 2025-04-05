import Link from 'next/link';
import CloudinaryImage from './CloudinaryImage';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageId: string;
}

export default function ProductCard({ id, name, price, imageId }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Link href={`/product/${id}`}>
        <div className="aspect-square overflow-hidden">
          <CloudinaryImage 
            src={imageId} 
            alt={name}
            width={300}
            height={300}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium">{name}</h3>
          <p className="mt-1">${price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}
