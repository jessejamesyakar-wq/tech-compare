import { Product } from './types';

export const mockHeadphones: Product[] = [
  {
    id: 'apple-airpods-pro-2-usbc',
    slug: 'apple-airpods-pro-2-usbc',
    name: 'Apple AirPods Pro (2. Nesil) USB-C MagSafe Şarj Kutulu TWS Kulaklık',
    brand: 'Apple',
    category: 'headphones',
    rating: 4.97,
    reviewCount: 3840,
    basePrice: 11499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985',
    highlights: ['H2 Kulaklık Çipi & Pro Seviye ANC', 'Kişiselleştirilmiş Uzamsal Ses', 'Toza, Tere ve Suya Dayanıklılık (IP54)', '30 Saate Kadar Toplam Dinleme Süresi'],
    storeOffers: [
      { id: 'hb-hp-1', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 11299, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.9, sellerReviews: 12400, url: 'https://www.hepsiburada.com' },
      { id: 'ty-hp-1', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 11399, inStock: true, shippingDays: 1, badges: ['Hızlı Teslimat'], sellerRating: 4.8, sellerReviews: 18900, url: 'https://www.trendyol.com' },
      { id: 'vt-hp-1', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 11499, inStock: true, shippingDays: 1, badges: ['Apple Yetkili Satıcı'], sellerRating: 4.9, sellerReviews: 5400, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 11999, store: 'Vatan' },
      { date: '2026-06-01', price: 11699, store: 'Vatan' },
      { date: '2026-07-01', price: 11499, store: 'Vatan' }
    ]
  },
  {
    id: 'sony-wh-1000xm5-siyah',
    slug: 'sony-wh-1000xm5-siyah',
    name: 'Sony WH-1000XM5 Kablosuz Gürültü Engelleme Özellikli Kulak Üstü Kulaklık',
    brand: 'Sony',
    category: 'headphones',
    rating: 4.95,
    reviewCount: 2150,
    basePrice: 15499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    highlights: ['Sektör Lideri Çift İşlemcili ANC', 'LDAC Yüksek Çözünürlüklü Ses', '30 Saat Pil Ömrü & Hızlı Şarj', 'Ultra Konforlu Hafif Tasarım'],
    storeOffers: [
      { id: 'hb-hp-2', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 15299, inStock: true, shippingDays: 1, badges: ['Sony Eurasia Garantili'], sellerRating: 4.9, sellerReviews: 6100, url: 'https://www.hepsiburada.com' },
      { id: 'vt-hp-2', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 15499, inStock: true, shippingDays: 1, badges: ['Mağazadan Teslim'], sellerRating: 4.9, sellerReviews: 2900, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 16499, store: 'Hepsiburada' },
      { date: '2026-06-01', price: 15999, store: 'Hepsiburada' },
      { date: '2026-07-01', price: 15499, store: 'Hepsiburada' }
    ]
  },
  {
    id: 'apple-airpods-max-usbc-2024',
    slug: 'apple-airpods-max-usbc-2024',
    name: 'Apple AirPods Max USB-C Gece Yarısı Kulak Üstü Bluetooth Kulaklık',
    brand: 'Apple',
    category: 'headphones',
    rating: 4.93,
    reviewCount: 980,
    basePrice: 26999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-202409-midnight?fmt=jpeg&qlt=95',
    highlights: ['Yüksek Düzey Aktif Gürültü Engelleme', 'Kişiselleştirilmiş Uzamsal Ses', 'USB-C Şarj Desteği', 'Özel Akustik Tasarım'],
    storeOffers: [
      { id: 'vt-hp-3', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 26999, inStock: true, shippingDays: 1, badges: ['Resmi Apple Garantili'], sellerRating: 4.9, sellerReviews: 1450, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 27999, store: 'Vatan' },
      { date: '2026-06-01', price: 26999, store: 'Vatan' }
    ]
  },
  {
    id: 'jbl-tune-520bt-siyah',
    slug: 'jbl-tune-520bt-siyah',
    name: 'JBL Tune 520BT Multi Connect Kablosuz Kulak Üstü Kulaklık',
    brand: 'JBL',
    category: 'headphones',
    rating: 4.88,
    reviewCount: 8900,
    basePrice: 1799,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    highlights: ['JBL Pure Bass Ses Teknolojisi', '57 Saate Kadar Pil Ömrü', 'Bluetooth 5.3 & Çoklu Bağlantı', 'Hafif ve Katlanabilir Tasarım'],
    storeOffers: [
      { id: 'hb-hp-4', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 1749, inStock: true, shippingDays: 1, badges: ['Fiyat / Performans Şampiyonu'], sellerRating: 4.8, sellerReviews: 32000, url: 'https://www.hepsiburada.com' },
      { id: 'ty-hp-4', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 1779, inStock: true, shippingDays: 1, badges: ['Çok Satan'], sellerRating: 4.8, sellerReviews: 45000, url: 'https://www.trendyol.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 1999, store: 'Trendyol' },
      { date: '2026-06-01', price: 1849, store: 'Trendyol' },
      { date: '2026-07-01', price: 1799, store: 'Trendyol' }
    ]
  },
  {
    id: 'samsung-galaxy-buds-3-pro',
    slug: 'samsung-galaxy-buds-3-pro',
    name: 'Samsung Galaxy Buds 3 Pro ANC Kablosuz Kulaklık',
    brand: 'Samsung',
    category: 'headphones',
    rating: 4.91,
    reviewCount: 1450,
    basePrice: 6999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    highlights: ['Galaxy AI Akıllı Gürültü Kontrolü', '2 Yollu Hoparlör (Hi-Fi Ses)', 'Blade Lights Tasarım', '30 Saat Toplam Kullanım'],
    storeOffers: [
      { id: 'hb-hp-5', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 6799, inStock: true, shippingDays: 1, badges: ['Samsung Türkiye Garantili'], sellerRating: 4.9, sellerReviews: 4300, url: 'https://www.hepsiburada.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 7499, store: 'Samsung' },
      { date: '2026-06-01', price: 6999, store: 'Samsung' }
    ]
  },
  {
    id: 'marshall-major-iv-bluetooth',
    slug: 'marshall-major-iv-bluetooth',
    name: 'Marshall Major IV Kablosuz Kulak Üstü Kulaklık Siyah',
    brand: 'Marshall',
    category: 'headphones',
    rating: 4.92,
    reviewCount: 3100,
    basePrice: 5499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    highlights: ['80+ Saat Kablosuz Çalma Süresi', 'İkonik Marshall Vintage Tasarımı', 'Kablosuz Şarj Desteği', 'Çok Yönlü Kontrol Düğmesi'],
    storeOffers: [
      { id: 'ty-hp-6', storeName: 'Trendyol', storeLogoColor: 'bg-amber-600', price: 5399, inStock: true, shippingDays: 1, badges: ['Resmi İthalatçı'], sellerRating: 4.9, sellerReviews: 7600, url: 'https://www.trendyol.com' }
    ],
    priceHistory: [
      { date: '2026-05-01', price: 5899, store: 'Trendyol' },
      { date: '2026-06-01', price: 5499, store: 'Trendyol' }
    ]
  }
];
