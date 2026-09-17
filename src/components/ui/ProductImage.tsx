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

// Tarayıcı hafızasında kırık URL'leri önbelleğe alıp tekrar eden istekleri engeller
const reportedBrokenUrls = new Set<string>();

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
    // 1. Kullanıcı deneyimini bozmadan anında yedek görseli göster
    setImgSrc(FALLBACK_IMAGE);

    const failedSrc = src;
    if (!failedSrc || failedSrc === FALLBACK_IMAGE || reportedBrokenUrls.has(failedSrc)) {
      return;
    }
    reportedBrokenUrls.add(failedSrc);

    // 2. RoboPengu Site Watchdog Sentinel: Arka planda sessizce tamir ve anomali bildirimi
    try {
      fetch("/api/watchdog/broken-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName: productName || alt,
          category,
          brand,
          failedSrc,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            // Eğer Icecat/Pipeline başarıyla yeni görsel indirdiyse anında hot-swap yap
            if (data?.success && data?.repairedImage && data.repairedImage !== FALLBACK_IMAGE) {
              setImgSrc(data.repairedImage);
            }
          }
        })
        .catch(() => {
          // Arka plan izleyicisinde ağ hatalarını sessizce yut
        });
    } catch {
      // Hata yok say
    }
  };

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
        onError={handleImageError}
      />
    </div>
  );
}

export { ProductImage };
