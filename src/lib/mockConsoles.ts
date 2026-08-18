import { Product } from './types';

export const mockConsoles: Product[] = [
  {
    id: 'sony-playstation-5-pro',
    slug: 'sony-playstation-5-pro-2tb',
    name: 'SONY PlayStation 5 Pro (PS5 Pro) 2TB SSD / PSSR AI Upscaling / 4K 120Hz Ray Tracing Oyun Konsolu',
    brand: 'Sony',
    category: 'consoles',
    rating: 4.98,
    reviewCount: 480,
    basePrice: 49999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-blacktitanium?fmt=jpeg&qlt=95',
    highlights: ['PSSR (PlayStation Spectral Super Resolution) AI', '%67 Daha Güçlü GPU Performansı', '2TB Ultra-Speed SSD Standart', 'Gelişmiş Donanımsal Işın İzleme'],
    storeOffers: [
      { id: 'vatan', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 49999, inStock: true, shippingDays: 1, badges: ['👑 Amiral Gemisi Konsol'], sellerRating: 4.9, sellerReviews: 1200, url: '#' }
    ],
    priceHistory: [
      { date: '2024-11', price: 48999, store: 'Vatan' },
      { date: '2026-08', price: 49999, store: 'Vatan' }
    ]
  },
  {
    id: 'nintendo-switch-oled',
    slug: 'nintendo-switch-oled-beyaz',
    name: 'NINTENDO Switch OLED Model Beyaz 64GB El Konsolu',
    brand: 'Nintendo',
    category: 'consoles',
    rating: 4.91,
    reviewCount: 980,
    basePrice: 14999,
    currency: 'TL',
    releaseYear: 2023,
    isPopular: true,
    isFeatured: false,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-blacktitanium?fmt=jpeg&qlt=95',
    highlights: ['7" Canlı OLED Ekran', 'Geniş Ayarlanabilir Stant', 'Dahili LAN Portlu TV Dock', 'El & TV Modu Hibrit Kullanım'],
    storeOffers: [
      { id: 'hb', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 14999, inStock: true, shippingDays: 1, badges: ['İthalatçı Garantili'], sellerRating: 4.8, sellerReviews: 2400, url: '#' }
    ],
    priceHistory: [
      { date: '2023-05', price: 11999, store: 'Hepsiburada' },
      { date: '2026-08', price: 14999, store: 'Hepsiburada' }
    ]
  }
];
