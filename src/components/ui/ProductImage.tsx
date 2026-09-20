"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { isProductImagePlaceholder } from '@/lib/productImages';
import { ImageOff } from 'lucide-react';

export type ProductImageVariant = "card" | "detail";

export interface ProductImageProps {
  src: string;
  alt: string;
  variant: ProductImageVariant;
  priority?: boolean;
  className?: string;
  productId?: string;
  productName?: string;
  category?: string;
  brand?: string;
}

/**
 * TEK BOYUT KAYNAĞI
 * Kart ve detay görünümleri için sabit en-boy oranları burada tanımlı.
 */
const VARIANT_CONFIG: Record<
  ProductImageVariant,
  { aspectRatio: string; sizes: string; objectFit: "contain" | "cover" }
> = {
  card: {
    aspectRatio: "1 / 1",
    sizes: "(max-width: 768px) 50vw, 25vw",
    objectFit: "contain",
  },
  detail: {
    aspectRatio: "1 / 1",
    sizes: "(max-width: 768px) 100vw, 500px",
    objectFit: "contain",
  },
};

// Ürün görseli hiç yüklenemezse veya URL bozuksa gösterilecek yedek görsel.
const FALLBACK_IMAGE = "/images/product-placeholder.png";

export default function ProductImage({
  src,
  alt,
  variant,
  priority = false,
  className = "",
  productId,
  productName,
  category,
  brand,
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  const handleImageError = () => {
    // A failed image must not let an anonymous browser trigger server-side repair,
    // persistent anomaly writes or outbound notifications.
    if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${variant === 'card' ? 'rounded-xl bg-white' : 'bg-transparent'} ${className}`}
      style={{ aspectRatio: config.aspectRatio }}
    >
      {isProductImagePlaceholder(imgSrc) ? <div
        role="img"
        aria-label={`${alt} — ürün görseli doğrulanmayı bekliyor`}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 px-3 text-center text-slate-600"
      >
        <ImageOff className="h-10 w-10 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-relaxed">Ürün görseli<br/>doğrulanmayı bekliyor</p>
      </div> : <Image
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={config.sizes}
        style={{ objectFit: config.objectFit }}
        onError={handleImageError}
      />}
    </div>
  );
}

export { ProductImage };
