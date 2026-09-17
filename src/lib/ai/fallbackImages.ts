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

  // 1. Konsol / Oyun Cihazları
  if (
    combined.includes("playstation") ||
    combined.includes("ps5") ||
    combined.includes("ps4") ||
    combined.includes("xbox") ||
    combined.includes("nintendo") ||
    cat.includes("console") ||
    cat.includes("konsol")
  ) {
    if (combined.includes("xbox")) {
      return "/images/products/consoles/microsoft-xbox-series-x.jpg";
    }
    return "/images/products/consoles/sony-playstation-5-slim.jpg";
  }

  // 2. Televizyon / Ekran / Monitör
  if (
    cat.includes("tv") ||
    cat.includes("televizyon") ||
    combined.includes("oled") ||
    combined.includes("qled") ||
    combined.includes("qned") ||
    combined.includes("televizyon") ||
    combined.includes("bravia")
  ) {
    return "/images/products/tvs/lg-55qned81b6a-1.jpg";
  }

  // 3. Laptop / Bilgisayar
  if (
    cat.includes("laptop") ||
    cat.includes("bilgisayar") ||
    cat.includes("notebook") ||
    combined.includes("macbook") ||
    combined.includes("thinkpad") ||
    combined.includes("zenbook")
  ) {
    if (combined.includes("macbook")) {
      return "/images/products/laptops/apple-macbook-air-m3.jpg";
    }
    return "/images/laptops/lg-395128.jpg";
  }

  // 4. Tablet
  if (cat.includes("tablet") || combined.includes("ipad") || combined.includes("tab")) {
    if (combined.includes("ipad")) {
      return "/images/tablets/apple-ipad-air-11-m2.jpg";
    }
    return "/images/tablets/hometech-1003676.jpg";
  }

  // 5. Kulaklık
  if (cat.includes("headphone") || cat.includes("kulaklik") || cat.includes("kulaklık")) {
    return "/images/products/headphones/apple-airpods-pro-2.jpg";
  }

  // 6. Akıllı Saat
  if (cat.includes("smartwatch") || cat.includes("saat") || combined.includes("watch")) {
    return "/images/smartwatches/apple/apple-watch-series-10-46mm.jpg";
  }

  // 7. Apple Telefonlar
  if (
    combined.includes("iphone") ||
    (combined.includes("apple") && cat.includes("phone"))
  ) {
    if (combined.includes("16") && (combined.includes("max") || combined.includes("pro"))) {
      return "/images/phones/apple/apple-iphone-16-pro-max.jpg";
    }
    if (combined.includes("16")) {
      return "/images/phones/apple/iphone-16-black.jpg";
    }
    if (combined.includes("15")) {
      return "/images/phones/apple/iphone-15-black.jpg";
    }
    return "/images/phones/apple/apple-iphone-16-pro-max.jpg";
  }

  // 8. Samsung Telefonlar
  if (
    combined.includes("samsung") ||
    combined.includes("galaxy")
  ) {
    if (combined.includes("s25") || combined.includes("25")) {
      return "/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png";
    }
    if (combined.includes("s24") || combined.includes("24")) {
      return "/images/phones/samsung/studio/samsung-galaxy-s24-ultra.png";
    }
    return "/images/phones/samsung/studio/samsung-galaxy-s24.png";
  }

  // 9. Xiaomi / Redmi / Poco
  if (
    combined.includes("xiaomi") ||
    combined.includes("redmi") ||
    combined.includes("poco")
  ) {
    return "/images/phones/xiaomi/poco-f6-pro.jpg";
  }

  // 10. Tarafsız Genel Yedek Görsel
  return "/images/product-placeholder.png";
}
