# ACELEETME — Mağaza Teklif Kapsamı, Eşleştirme ve Tazelik Politikası Planı

## 1. Amaç ve Veri Kaynakları Sınırı

Bu doküman, ACELEETME platformunda fiyat karşılaştırması hedeflenen mağaza tekliflerinin kapsamını, varyant eşleştirme kurallarını ve `src/lib/priceFreshness.ts` dosyasındaki mevcut tazelik politikasını tanımlar.

### Hedeflenen Mağaza Kaynakları (Entegrasyonu Doğrulanacak Kaynaklar):
- **Hepsiburada** (`hepsiburada.com`)
- **Trendyol** (`trendyol.com`)
- **MediaMarkt Türkiye** (`mediamarkt.com.tr`)
- **Vatan Bilgisayar** (`vatanbilgisayar.com`)
- **Amazon Türkiye** (`amazon.com.tr`)
- **Teknosa** (`teknosa.com`)

*Not: Yukarıdaki mağazalar platformun hedeflediği kaynaklardır; doğrudan ürün sayfası adaptörü doğrulanmadan "canlı doğrulanmış kaynak" olarak adlandırılamaz.*

---

## 2. Varyant Eşleştirme ve Kimlik Kuralları

1. **Model & Renk & Depolama Bütünlüğü:**
   - Teklifler yalnızca tam varyant (örn: `iPhone 16 Pro 256GB Buzul Mavisi`) eşleşmesinde aynı gruba dahil edilir.
   - Farklı depolama veya renk varyantı fiyatları tek bir üründe birleştirilmez.

2. **Doğrudan Bağlantı ve Satıcı Doğrulaması:**
   - Mağaza adı ve pazaryeri satıcı kimliği ayrıştırılır.
   - `inStock: true`, geçerli doğrudan ürün URL'sine sahip ve `isSearchUrl(url) === false` olan teklifler canlı doğrulanmış sıralamaya girebilir.
   - Arama sorgu URL'leri (`/ara?q=`, `/sr?q=`, `search.html`, `/s?k=`) negatif fixture/arama bağlantısı olarak değerlendirilir ve doğrudan ürün teklifi sayılmaz.

---

## 3. Uygulamadaki Tazelik Politikası (Price Freshness Policy)

`src/lib/priceFreshness.ts` kodundaki `PRICE_FRESHNESS_HOURS = 24` ve `MAX_ALLOWED_OFFER_AGE_DAYS = 30` sabitlerine göre uygulanan resmi politika:

- **Güncel Fiyat (Fresh Price):** Fiyat kontrol tarihi $\le 24$ saat olan teklifler (`"Güncel Fiyat"`).
- **Son Görülen Fiyat (Stale Price):** Fiyat kontrol tarihi $> 24$ saat ve $\le 30$ gün olan teklifler (`"Son görülen fiyat: DD.MM.YYYY"` etiketiyle gösterilir).
- **Zaman Aşımına Uğramış / Doğrulanmamış (Unverified / Expired):** $30$ günden eski, gelecekteki, geçersiz veya eksik tarihli teklifler (`"Fiyat doğrulanmadı"` olarak işaretlenir).

---

## 4. Negatif ve Pozitif Test Fixture Örnekleri (Fiyat / Stok / Bağlantı Tipi)

Aşağıdaki mock fixture seti, arama URL'lerinin negatif fixture olarak tespit edilmesini ve doğrudan ürün URL'lerinin ayrıştırılmasını örneklendirir:

```json
[
  {
    "variantId": "samsung-s24u-512gb-grey",
    "storeOffers": [
      {
        "storeName": "Amazon Türkiye",
        "price": 63709,
        "inStock": true,
        "lastCheckedAt": "2026-09-27T10:00:00.000Z",
        "url": "https://www.amazon.com.tr/s?k=Samsung%20Galaxy%20S24%20Ultra",
        "isSearchUrl": true,
        "note": "NEGATİF FIXTURE: Arama URL'si doğrudan ürün teklifi değildir."
      },
      {
        "storeName": "Trendyol",
        "price": 64799,
        "inStock": true,
        "lastCheckedAt": "2026-09-27T10:00:00.000Z",
        "url": "https://www.trendyol.com/samsung/galaxy-s24-ultra-512gb-gri-p-123456789",
        "isSearchUrl": false,
        "note": "POZİTİF FIXTURE: Doğrudan ürün sayfası URL'si."
      }
    ]
  }
]
```

---

## 5. Güvenlik ve Canlı Sistem İzolasyonu

- Bu aşamada canlı scraper, cron job veya veritabanı import işlemleri çalıştırılmaz.
- Bütün veri akışları statik fixture ve testlerle izole sınırda tutulur.
