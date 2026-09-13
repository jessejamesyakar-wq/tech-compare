"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export type ProductImageVariant = "card" | "detail";

export interface ProductImageProps {
  src: string;
  alt: string;
  variant: ProductImageVariant;
  priority?: boolean;
  className?: string;
}

/**
 * TEK BOYUT KAYNAĞI
 * Kart ve detay görünümleri için sabit en-boy oranları burada tanımlı.
 * Bu değerleri kendi tasarımına göre ayarlayabilirsin, ama mutlaka TEK
 * yerden yönetilmeli. Farklı bileşenlerde farklı oran/boyut mantığı
 * kullanmak, "biri küçük biri büyük render oluyor" sorununun asıl kaynağıydı.
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
// Bu, "alakasız/yanlış renkler" sorununun bir kısmının kaynağı olabilir:
// bozuk bir <img> kutusu boş kalınca arka plan rengi/gradient sızabiliyordu.
const FALLBACK_IMAGE = "/images/product-placeholder.png";

export default function ProductImage({
  src,
  alt,
  variant,
  priority = false,
  className = "",
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${variant === 'card' ? 'rounded-xl bg-white' : 'bg-transparent'} ${className}`}
      style={{ aspectRatio: config.aspectRatio }}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={config.sizes}
        style={{ objectFit: config.objectFit }}
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}

export { ProductImage };


