"use client";

import { CldImage } from 'next-cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  crop?: 'fill' | 'crop' | 'scale' | 'thumb' | 'limit' | 'pad';
}
export default function CloudinaryImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  crop = "crop"
}: CloudinaryImageProps) {
  return (
    <CldImage
      src={src}
      width={width}
      height={height}
      alt={alt}
      crop={crop}
      className={className}
    />
  );
}
