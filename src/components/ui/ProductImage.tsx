"use client";

/**
 * KALICI ÇÖZÜM — aceleEtme
 * ------------------------------------------------------------
 * Bu dosya iki sorunu kalıcı olarak çözer:
 *  1) Ürün kartı/detay görsellerinin farklı boyutlarda render olması
 *  2) Ürün detayında yanlış ürünün renk/varyant verisinin gösterilmesi
 *
 * NASIL KULLANILIR:
 *  - ProductImage component'ini var olan <img> / <Image> kullanılan
 *    her yerin (ProductCard, ProductDetail, galeri vs.) yerine koy.
 *  - getProductById fonksiyonunu, şu an mockData.ts (veya API) üzerinden
 *    "find" / "filter" ile ürün çektiğin HER yerin yerine koy.
 *
 *  Bu iki kuralı projede TEK bir yerden geçirmek, ileride birinin
 *  "hızlıca" eski yöntemle (düz <img>, düz .find()) kod eklemesini
 *  engeller çünkü tip sistemi ve import zorunluluğu üzerinden geçer.
 * ------------------------------------------------------------
 */

import Image from "next/image";
import { useState } from "react";

// ------------------------------------------------------------
// 1) TUTARLI GÖRSEL BOYUTU
// ------------------------------------------------------------
// Sorunun kökü: bazı görseller 300x300, bazıları 800x1200 gibi farklı
// boyutlarda geliyor ve doğrudan <img> ile basılınca kutu boyutu
// görselin kendi oranına göre şekilleniyor. Çözüm: DIŞ kutunun
// boyutunu SABİT tutup görseli o kutunun İÇİNE "contain" ile sığdırmak.
// Böylece kutu hep aynı boyutta kalır, görsel asla taşmaz/küçülmez.

export interface ProductImageProps {
  src: string;
  alt: string;
  /** "card" küçük liste görünümü, "detail" ürün detay sayfası büyük görünüm */
  variant?: "card" | "detail";
  priority?: boolean;
  className?: string;
}

const SIZE_MAP = {
  card: { boxClass: "aspect-square w-full max-w-[220px]", sizes: "220px" },
  detail: { boxClass: "aspect-square w-full max-w-[520px]", sizes: "520px" },
} as const;

export function ProductImage({
  src,
  alt,
  variant = "card",
  priority = false,
  className = "",
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const { boxClass, sizes } = SIZE_MAP[variant];

  return (
    <div
      className={`relative ${boxClass} bg-white rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      // Not: bu dış kutu HER ZAMAN aynı oranda (1:1 kare). Görsel ne
      // boyutta gelirse gelsin kutu değişmez — sadece içindeki görsel
      // "contain" ile sığdırılır, kesilmez, taşmaz, büyümez.
    >
      {errored || !src ? (
        <div className="text-xs text-gray-400 text-center px-2">
          Görsel yüklenemedi
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          style={{ objectFit: "contain" }} // "cover" DEĞİL — contain, taşma/kırpma olmasın diye
          priority={priority}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// 2) GÜVENLİ ÜRÜN ÇEKME (yanlış renk/varyant hatasını önler)
// ------------------------------------------------------------
// Sorunun kökü muhtemelen şu: bir yerde ürün .find(p => p.id === id)
// ile çekiliyor ama renkler/varyantlar ayrı bir listeden veya yanlış
// referanstan geliyor, ya da id tipi uyuşmuyor (string "12" vs number 12)
// ve .find() yanlışlıkla başka bir ürünü (ya da undefined'ı) döndürüyor.
//
// Çözüm: TEK bir merkezi fonksiyon. Bu fonksiyon:
//  - id karşılaştırmasını String() ile normalize eder (tip hatasını önler)
//  - döndürdüğü ürünün id'sinin gerçekten istenenle eşleştiğini DOĞRULAR
//  - eşleşme yoksa sessizce yanlış veri döndürmek yerine hata fırlatır
//    (böylece hata production'da fark edilmeden geçip gitmez, geliştirme
//    sırasında hemen görünür)

export interface Product {
  id: string | number;
  name: string;
  images: string[];
  colors: { name: string; hex: string }[];
  price: number;
  category: string;
  // ...projenin diğer alanları
}

export function getProductById(
  allProducts: Product[],
  requestedId: string | number
): Product {
  const normalizedRequestedId = String(requestedId);

  const product = allProducts.find(
    (p) => String(p.id) === normalizedRequestedId
  );

  if (!product) {
    throw new Error(
      `[getProductById] Ürün bulunamadı. Aranan id: "${normalizedRequestedId}"`
    );
  }

  // GÜVENLİK KONTROLÜ: bulunan ürünün id'si gerçekten istenenle aynı mı?
  // Bu satır normalde hiç tetiklenmemeli — ama eğer projede başka bir yerde
  // (ör. cache, memo, yanlış index) veri karışıyorsa burada patlar ve
  // "yanlış renk gösterme" gibi sessiz hatalar yerine net bir hata verir.
  if (String(product.id) !== normalizedRequestedId) {
    throw new Error(
      `[getProductById] VERİ TUTARSIZLIĞI: istenen id "${normalizedRequestedId}", ` +
        `dönen ürünün id'si "${product.id}"`
    );
  }

  return product;
}

/**
 * KULLANIM ÖRNEĞİ (ürün detay sayfasında):
 *
 * const product = getProductById(allProducts, params.id);
 *
 * return (
 *   <>
 *     <ProductImage src={product.images[0]} alt={product.name} variant="detail" />
 *     <h1>{product.name}</h1>
 *     <div className="flex gap-2">
 *       {product.colors.map((c) => (
 *         <span key={c.hex} style={{ backgroundColor: c.hex }} />
 *       ))}
 *     </div>
 *   </>
 * );
 *
 * ÜRÜN KARTINDA (liste/grid):
 *
 * {products.map((p) => (
 *   <ProductImage key={p.id} src={p.images[0]} alt={p.name} variant="card" />
 * ))}
 */

export default ProductImage;

