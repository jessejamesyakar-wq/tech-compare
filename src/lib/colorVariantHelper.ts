import { BaseProduct, Product, ProductVariant } from './types';

export interface ResolvedColorOption {
  name: string;
  hex: string;
  image?: string;
  images?: string[];
  variantId?: string;
  price?: number;
}

/**
 * Normalizes a string for robust fuzzy matching of color names (Turkish/English characters removed)
 */
export function normalizeColorString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts and unifies all available color options from a product
 */
export function getProductColorList(product: BaseProduct | Product): ResolvedColorOption[] {
  if (!product) return [];

  // Priority 1: product.colorOptions
  if (product.colorOptions && product.colorOptions.length > 0) {
    return product.colorOptions.map((co: any) => {
      // Find matching variant if exists
      const matchingVariant = product.variants?.find((v: ProductVariant) => {
        const vName = v.colorName || v.name;
        return (
          vName.toLowerCase() === co.name.toLowerCase() ||
          normalizeColorString(vName) === normalizeColorString(co.name)
        );
      });

      return {
        name: co.name,
        hex: co.hex || matchingVariant?.colorHex || '#334155',
        image: co.image || matchingVariant?.image || product.image,
        images: co.images || matchingVariant?.images || (co.image ? [co.image] : undefined),
        variantId: matchingVariant?.id,
        price: matchingVariant?.price || (matchingVariant?.priceOffset ? product.basePrice + matchingVariant.priceOffset : product.basePrice),
      };
    });
  }

  // Priority 2: product.variants with color details
  if (product.variants && product.variants.length > 0) {
    return product.variants.map((v: ProductVariant) => ({
      name: v.colorName || v.name,
      hex: v.colorHex || '#334155',
      image: v.image || product.image,
      images: v.images || (v.image ? [v.image] : undefined),
      variantId: v.id,
      price: v.price || (v.priceOffset ? product.basePrice + v.priceOffset : product.basePrice),
    }));
  }

  return [];
}

/**
 * Resolves the active color, image, and gallery images based on URL params or default
 */
export function resolveActiveColor(
  product: BaseProduct | Product,
  colorParam?: string | null,
  variantIdParam?: string | null
): {
  selectedColor: string;
  selectedColorImage: string;
  selectedColorImages: string[];
  selectedVariantId?: string;
  selectedPrice?: number;
} {
  const colors = getProductColorList(product);
  const fallbackImg = product.image || '';

  if (colors.length === 0) {
    return {
      selectedColor: '',
      selectedColorImage: fallbackImg,
      selectedColorImages: product.images && product.images.length > 0 ? product.images : [fallbackImg].filter(Boolean),
    };
  }

  // 1. Try matching by variantIdParam
  if (variantIdParam) {
    const matched = colors.find((c) => c.variantId === variantIdParam);
    if (matched) {
      const activeImg = matched.image || fallbackImg;
      return {
        selectedColor: matched.name,
        selectedColorImage: activeImg,
        selectedColorImages: matched.images && matched.images.length > 0 ? matched.images : [activeImg],
        selectedVariantId: matched.variantId,
        selectedPrice: matched.price,
      };
    }
  }

  // 2. Try matching by colorParam
  if (colorParam) {
    const normParam = normalizeColorString(colorParam);
    const matched = colors.find((c) => {
      const normName = normalizeColorString(c.name);
      return (
        normName === normParam ||
        normName.includes(normParam) ||
        normParam.includes(normName)
      );
    });

    if (matched) {
      const activeImg = matched.image || fallbackImg;
      return {
        selectedColor: matched.name,
        selectedColorImage: activeImg,
        selectedColorImages: matched.images && matched.images.length > 0 ? matched.images : [activeImg],
        selectedVariantId: matched.variantId,
        selectedPrice: matched.price,
      };
    }
  }

  // 3. Default to the 1st valid color option
  const first = colors[0];
  const activeImg = first.image || fallbackImg;
  return {
    selectedColor: first.name,
    selectedColorImage: activeImg,
    selectedColorImages: first.images && first.images.length > 0 ? first.images : [activeImg],
    selectedVariantId: first.variantId,
    selectedPrice: first.price,
  };
}
