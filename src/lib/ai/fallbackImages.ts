/**
 * Smart product image resolution and fallback mappings.
 * Returns authentic, high-resolution product photography for known brands and models,
 * preventing empty images or raw text/emoji placeholders.
 */

export function getFallbackProductImage(
  name: string = "",
  brand: string = "",
  category: string = "phones"
): string {
  const combined = `${name || ""} ${brand || ""}`.toLowerCase();
  const cat = (category || "").toLowerCase();

  // 1. Apple Products
  if (
    combined.includes("iphone") ||
    combined.includes("apple") ||
    combined.includes("ios")
  ) {
    if (combined.includes("duo")) {
      return "/images/phones/apple/apple-iphone-duo.png";
    }
    if (combined.includes("18") && (combined.includes("max") || combined.includes("pro"))) {
      return "/images/phones/apple/apple-iphone-18-pro-max-12.jpg";
    }
    if (combined.includes("18")) {
      return "/images/phones/apple/apple-iphone-18-pro.png";
    }
    if (combined.includes("17") && (combined.includes("max") || combined.includes("pro"))) {
      return "/images/phones/apple/iphone-17-promax-cosmicorange.jpg";
    }
    if (combined.includes("17")) {
      return "/images/phones/apple/apple-iphone-17.jpg";
    }
    if (combined.includes("16") && (combined.includes("max") || combined.includes("pro"))) {
      return "/images/phones/apple/apple-iphone-16-pro-max.jpg";
    }
    if (combined.includes("16")) {
      return "/images/phones/apple/iphone-16-black.jpg";
    }
    if (combined.includes("15")) {
      return "/images/phones/apple/iphone-15-black.jpg";
    }
    return "/images/phones/apple/apple-iphone-18-pro-max-2.png";
  }

  // 2. Samsung Products
  if (
    combined.includes("samsung") ||
    combined.includes("galaxy")
  ) {
    if (combined.includes("s26") || combined.includes("26")) {
      return "/images/phones/samsung/studio/samsung-galaxy-s26-ultra.png";
    }
    if (combined.includes("s25") || combined.includes("25")) {
      return "/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png";
    }
    if (combined.includes("s24") || combined.includes("24")) {
      return "/images/phones/samsung/studio/samsung-galaxy-s24-ultra.png";
    }
    if (combined.includes("fold") || combined.includes("flip")) {
      return "/images/phones/samsung/official/galaxy-z-fold8-i-in-n-sipari-verin.png";
    }
    return "/images/phones/samsung/studio/samsung-galaxy-s24.png";
  }

  // 3. Xiaomi / Redmi / Poco
  if (
    combined.includes("xiaomi") ||
    combined.includes("redmi") ||
    combined.includes("poco")
  ) {
    if (combined.includes("poco")) {
      return "/images/phones/xiaomi/poco-f8-ultra.png";
    }
    return "/images/phones/xiaomi/poco-f6-pro.jpg";
  }

  // 4. Categories Fallback
  if (cat.includes("tv") || cat.includes("televizyon")) {
    return "/images/tvs/grundig_oled.jpg";
  }
  if (cat.includes("laptop") || cat.includes("bilgisayar") || cat.includes("notebook")) {
    return "/images/laptops/lg-395128.jpg";
  }
  if (cat.includes("tablet")) {
    return "/images/tablets/hometech-1003676.jpg";
  }

  // 5. Default high-resolution device placeholder
  return "/images/phones/apple/apple-iphone-18-pro-max-2.png";
}
