import { Product } from './types';

export const mockHeadphones: Product[] = [
  {
    id: 'apple-airpods-max-2-usbc',
    slug: 'apple-airpods-max-usbc-2024',
    name: 'APPLE AirPods Max USB-C Aktif Gürültü Engelleme ANC / Gece Yarısı Kulak Üstü Bluetooth Kulaklık',
    brand: 'Apple',
    category: 'headphones',
    rating: 4.93,
    reviewCount: 380,
    basePrice: 24999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-202409-midnight?fmt=jpeg&qlt=95',
    highlights: ['Aktif Gürültü Engelleme (ANC)', 'Uzamsal Ses & Dinamik Kafa İzleme', 'USB-C Hızlı Şarj Portu', '20 Saat Pil Ömrü'],
    storeOffers: [
      { id: 'vatan', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800', price: 24999, inStock: true, shippingDays: 1, badges: ['Resmi Apple Garantili'], sellerRating: 4.9, sellerReviews: 950, url: '#' }
    ],
    priceHistory: [
      { date: '2024-09', price: 23999, store: 'Vatan' },
      { date: '2026-08', price: 24999, store: 'Vatan' }
    ]
  },
  {
    id: 'sony-wh-1000xm5',
    slug: 'sony-wh-1000xm5-siyah',
    name: 'SONY WH-1000XM5 Siyah Kablosuz Kulak Üstü Gürültü Engellemeli Kulaklık',
    brand: 'Sony',
    category: 'headphones',
    rating: 4.96,
    reviewCount: 1150,
    basePrice: 15499,
    currency: 'TL',
    releaseYear: 2023,
    isPopular: true,
    isFeatured: true,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-202409-midnight?fmt=jpeg&qlt=95',
    highlights: ['Sektör Lideri İki İşlemcili ANC', 'LDAC Yüksek Çözünürlüklü Ses', '30 Saat Pil Ömrü & Hızlı Şarj', 'Çoklu Cihaz Bağlantısı'],
    storeOffers: [
      { id: 'hb', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-500', price: 15499, inStock: true, shippingDays: 1, badges: ['🔥 Çok Satan Hi-Fi Kulaklık'], sellerRating: 4.9, sellerReviews: 3100, url: '#' }
    ],
    priceHistory: [
      { date: '2023-08', price: 12999, store: 'Hepsiburada' },
      { date: '2026-08', price: 15499, store: 'Hepsiburada' }
    ]
  }
];
