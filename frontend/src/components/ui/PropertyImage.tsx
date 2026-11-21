'use client';

import React from 'react';
import Image from 'next/image';

interface PropertyImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

// Fallback placeholder image (Unsplash — no account needed, free to use)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
];

export function PropertyImage({ src, alt, className = '', priority = false, fill = true, sizes }: PropertyImageProps) {
  const [imgSrc, setImgSrc] = React.useState(src || FALLBACK_IMAGES[0]);
  const [error, setError] = React.useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
      setImgSrc(FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]);
    }
  };

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        onError={handleError}
        priority={priority}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={800}
      height={500}
      className={`object-cover ${className}`}
      onError={handleError}
      priority={priority}
    />
  );
}

export { FALLBACK_IMAGES };
