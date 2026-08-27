# TechKıyas – Otomatik Fiyat Toplama & Mağaza Entegrasyon Altyapısı

TechKıyas için 8 büyük pazar yeri ve teknoloji mağazası (**Amazon, Trendyol, Hepsiburada, n11, PttAVM, MediaMarkt, Vatan Bilgisayar, Teknosa**) için modüler, ölçeklenebilir (10.000+ ürün), kuyruk tabanlı ve tip güvenli otomatik fiyat toplama motoru.

---

## 🏗️ 1. Temel Mimari

```
Frontend (Ürün Detay & Karşılaştırma)
       ↓
Backend API (/api/products/:id/prices)
       ↓
Product Catalog (GTIN / EAN / Barkod / SKU)
       ↓
Product Matching Engine (Barkod > Model > Varyant Kontrollü Eşleme)
       ↓
Queue & Scheduler (Redis / KV / Priority Queue: High/Normal/Low)
       ↓
Price Workers (Store-specific Rate Limiter & Concurrency Manager)
       ↓
Store Adapters (Amazon, Trendyol, Hepsiburada, n11, PttAVM, MediaMarkt, Vatan, Teknosa)
       ↓
Price Normalizer & Anomaly Detector (PRICE_ANOMALY, Decimal, Kargo Dahil)
       ↓
PostgreSQL / Supabase & In-Memory Cache
       ↓
Frontend (Canlı Fiyat Tablosu, En Ucuz Rozeti, Fiyat Geçmişi)
```

---

## 🔑 2. Ortam Değişkenleri (.env)

Gerekli mağaza API anahtarlarını `.env` veya Vercel Dashboard > Environment Variables kısmına ekleyin:

```env
# Veritabanı & Kuyruk
DATABASE_URL=postgresql://postgres:password@localhost:5432/techkiyas
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
CRON_SECRET=your_super_secret_cron_key_32_chars

# Mağaza Aktif / Pasif Kontrolleri
STORE_AMAZON_ENABLED=true
STORE_TRENDYOL_ENABLED=true
STORE_HEPSIBURADA_ENABLED=true
STORE_N11_ENABLED=true
STORE_PTTAVM_ENABLED=true
STORE_MEDIAMARKT_ENABLED=true
STORE_VATAN_ENABLED=true
STORE_TEKNOSA_ENABLED=true

# Amazon PA-API / SP-API
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=

# Trendyol Marketplace API
TRENDYOL_API_KEY=
TRENDYOL_API_SECRET=
TRENDYOL_SUPPLIER_ID=

# Hepsiburada Merchant API
HEPSIBURADA_USERNAME=
HEPSIBURADA_PASSWORD=
HEPSIBURADA_MERCHANT_ID=

# n11 API
N11_API_KEY=
N11_API_SECRET=

# PttAVM API
PTTAVM_API_KEY=
PTTAVM_API_SECRET=

# MediaMarkt Feed / API
MEDIAMARKT_API_KEY=
MEDIAMARKT_AFFILIATE_FEED_URL=

# Vatan Bilgisayar Feed / API
VATAN_API_KEY=
VATAN_FEED_URL=

# Teknosa Feed / API
TEKNOSA_API_KEY=
TEKNOSA_FEED_URL=
```

> **Önemli Kural:** API anahtarı girilmemiş mağazalar güvenli şekilde `NOT_CONFIGURED` durumunda kalır ve asla sahte/uydurma fiyat üretmez.

---

## 🗄️ 3. Veritabanı Kurulumu & Migration

Şemayı oluşturmak için `src/lib/db/schema.sql` dosyasını Supabase SQL Editor veya PostgreSQL istemcinizde çalıştırın:

- `stores`: Mağazalar ve API destek durumları.
- `products`: Kanonik ürünler ve GTIN/EAN/Barkod alanları.
- `store_products`: Mağaza ilan eşleştirmeleri ve güven skoru (`MATCHED`, `MATCH_REVIEW_REQUIRED`).
- `prices`: Kargo dahil toplam fiyatlar, stok durumu ve anomali bayrakları.
- `price_history`: Fiyat değişim kayıtları.
- `price_update_jobs`: Kuyruk ve güncelleme görevleri.

---

## ⚡ 4. Otomatik Zamanlayıcı (Vercel Cron)

Sistem `vercel.json` içerisindeki Cron tanımıyla her gün otomatik olarak `/api/cron/update-prices` endpoint'ini tetikler:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## 🛠️ 5. Yeni Mağaza Adapter'ı Ekleme

Yeni bir mağaza eklemek için:

1. `src/integrations/stores/yeni-magaza/index.ts` dosyasını oluşturun ve `BaseStoreAdapter` sınıfından türetin.
2. `isConfigured()`, `searchProduct()`, `getPrice()`, `getStock()` metodlarını yazın.
3. `src/integrations/stores/registry.ts` içerisindeki `StoreRegistry` sınıfına kaydedin.

---

## 🛡️ 6. Fiyat Anomali Koruması (Price Anomaly Guard)

Bir mağazada hatalı veri girişi nedeniyle fiyat bir anda olağandışı düşerse (örn: 59.999 ₺ yerine 599 ₺ girilmesi gibi %70+ ani düşüşler), `PriceAnomalyDetector` bu fiyatı `PRICE_ANOMALY` olarak işaretler ve vitrine en ucuz fiyat olarak yansımasını engeller. Admin panelinde `/admin/stores` altında incelenebilir.
