## 📅 2026-08-30

### 0. 10 Adet Akıllı Telefon Modelinin Geri Yüklenmesi & Sayaç Tutarlılığı
- **Tarih:** 2026-08-30 20:53
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`, `src/app/page.tsx`, `data/catalog_baseline.json`
- **Yapılan Değişiklik:**
  - Önceki slug deduplication döngüsünde yanlışlıkla filtrelenen 10 adet Samsung depolama varyantı modeli (`S26 Ultra 256GB`, `S26+ 256GB`, `S26 128GB`, `S25 Ultra 256GB`, `S25+ 256GB`, `S25 128GB`, `S25 FE 128GB`, `A57 5G 128GB`, `A37 5G 128GB`, `A17 5G 128GB`) benzersiz slug'ları ve depolama isimleriyle eksiksiz geri yüklendi.
  - Akıllı telefon sayısı **357 modele**, katalog toplamı **5.291 ürüne** yükseltildi.
  - Ana sayfadaki tüm sayaçlar tek bir kaynaktan (`allPhones.length`) beslenecek şekilde senkronize edildi.
- **Gerekçe:** Ürün kaybının önlenmesi ve tek gerçek kaynak (Single Source of Truth) ilkemize uyulması.

---

### 1. Veri Güvenlik & Bütünlük Altyapısı (Data Integrity Gatekeeper)
- **Tarih:** 2026-08-30 20:38
- **Etkilenen Dosyalar:** `src/lib/types.ts`, `scripts/preDeployCheck.js`, `data/catalog_baseline.json`
- **Yapılan Değişiklik:**
  - `ProductVariant` arayüzü tanımlandı (`id`, `name`, `colorName`, `colorHex`, `image`, `images`, `priceOffset`, `inStock`, `sku`).
  - `BaseProduct` ve `Product` tiplerine `variants?: ProductVariant[]` eklendi.
  - `scripts/preDeployCheck.js` güvenlik geçidi kuruldu: Ürün sayısı kaybı (data loss), diskte olmayan kırık görsel, mükerrer ID/slug ve paylaşılan genel görsel tespitleri otomatikleştirildi.
  - `data/catalog_baseline.json` anlık envanter koruma dosyası oluşturuldu (5.281 ürün).
- **Gerekçe:** Ürün verilerinin sessizce bozulmasını veya kaybolmasını engellemek, deploy öncesi %100 bütünlük garantisi sağlamak.

---

### 2. 301 Kalıcı URL Yönlendirmeleri (301 Permanent Redirects) Kurulumu
- **Tarih:** 2026-08-30 21:06
- **Etkilenen Dosyalar:** `next.config.ts`, `data/redirects.json`, `scripts/testRedirects.js`
- **Yapılan Değişiklik:**
  - 25 adet değişen veya normalize edilen eski ürün slug'ı için (`/phones/samsung-galaxy-s26-ultra`, `/headphones/samsung-galaxy-buds` vb.) Edge/Next.js seviyesinde **301 Permanent Redirect** yönlendirme kuralı tanımlandı.
  - `scripts/testRedirects.js` otomatik doğrulama testi eklendi ve tüm yönlendirme hedeflerinin canlı kataloğa 404 üretmeden yönlendiği teyit edildi.
- **Gerekçe:** Google SEO indeksleri, yer imleri ve dış bağlantılarda eski URL'leri ziyaret eden kullanıcıların 404 hatası almasını önlemek.

---

### 3. "+" Model Slug ve Teknik Özellik Ayrıştırması
- **Tarih:** 2026-08-30 20:24
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`, `src/lib/mockHeadphones.ts`, `src/lib/mockTablets.ts`, `public/images/phones/samsung/`
- **Yapılan Değişiklik:**
  - 12 adet Samsung Plus modeline (`S9+`, `S10+`, `Note 10+`, `S20+`, `S21+`, `S22+`, `S23+`, `S24+`, `S25+`, `S26+`, `A8+ 2018`, `A6+ 2018`) ana modelden bağımsız benzersiz slug'lar (`/phones/samsung-galaxy-s20-plus` vb.) atandı.
  - Plus modellerin gerçek ekran boyutu, RAM, batarya ve kamera özellikleri girildi.
  - Dedicated Plus görselleri `public/images/phones/samsung/` klasörüne kopyalanıp bağlandı.
- **Gerekçe:** "+" ile biten modellerin ana model sayfasına yönlenmesi ve yanlış fotoğraf/teknik özellik göstermesi sorunu çözüldü.

---

### 3. "Şimdi mi Al, Sonra mı?" Algoritmik Fiyat Karar Motoru
- **Tarih:** 2026-08-30 20:16
- **Etkilenen Dosyalar:** `src/lib/priceSignal.ts`, `src/components/detail/PriceSignalCard.tsx`, `src/components/detail/PriceHistoryChart.tsx`
- **Yapılan Değişiklik:**
  - 14 gün altı verilerde dürüstçe "Yetersiz Veri / Takipte" durumu gösteren algoritma kuruldu.
  - 14+ gün verisi olan ürünlerde dip seviye ("Şimdi Al"), tepe seviye ("Bekle") ve stabil ("Dengeli") sinyalleri veri odaklı olarak bağlandı.
- **Gerekçe:** Kullanıcıya boş/yanıltıcı tahmin yerine şeffaf ve matematiksel karar desteği sağlamak.

---

### 4. Harici Hotlink Görsellerinin Yerelleştirilmesi
- **Tarih:** 2026-08-30 20:00
- **Etkilenen Dosyalar:** `src/lib/mockTVs.ts`, `src/lib/mockMonitors.ts`, `src/lib/mockLaptops.ts`, `src/lib/smartphonesData.json`
- **Yapılan Değişiklik:**
  - `resim.epey.com` ve `www.lg.com` üzerinden gelen tüm harici görseller indirilerek `public/images/products/...` altına alındı. Harici hotlink sayısı 0'a indirildi.
- **Gerekçe:** Üçüncü parti kaynak bağımlılığını ve kırık görsel riskini ortadan kaldırmak.

### Applied 826 Genuine Manufacturer Laptop Images
- **Tarih:** 2026-08-30 21:20
- **Etkilenen Dosyalar:** `src/lib/mockLaptops.ts`
- **Yapılan Değişiklik:** Replaced generic fallback image with exact model-specific manufacturer product photos for 826 laptops across Apple, ASUS, Dell, Lenovo, HP, MSI, and Casper brands.
- **Gerekçe:** User explicitly approved genuine laptop images replacement proposal.

---

### Applied 29 Genuine Manufacturer Samsung Smartphone Images
- **Tarih:** 2026-08-30 21:30
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`
- **Yapılan Değişiklik:** Replaced temporary SVG vector illustrations with exact model-specific manufacturer product photos for 29 Samsung phones (Galaxy S24/S23/S22 series, Z Fold/Flip 6, A35/A55 5G, etc.).
- **Gerekçe:** User explicitly approved genuine Samsung phone images replacement proposal.

---

### Applied Multi-Color Variants & Images to 6 Samsung Flagship Models
- **Tarih:** 2026-08-30 21:40
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`
- **Yapılan Değişiklik:** Added structured ProductVariant arrays with distinct manufacturer color photos (Titanium Black, Gray, Violet, Yellow, Cream, Green, Mint, etc.) for 6 models (Galaxy S24 Ultra, S24+, S24, S23 Ultra, Z Fold 6, Z Flip 6, A55 5G).
- **Gerekçe:** User explicitly approved Samsung multi-color variants proposal.

---

### Applied Multi-Color Variants & Images to 7 Samsung Flagship Models
- **Tarih:** 2026-08-30 21:40
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`
- **Yapılan Değişiklik:** Added structured ProductVariant arrays with distinct manufacturer color photos (Titanium Black, Gray, Violet, Yellow, Cream, Green, Mint, etc.) for 7 models (Galaxy S24 Ultra, S24+, S24, S23 Ultra, Z Fold 6, Z Flip 6, A55 5G).
- **Gerekçe:** User explicitly approved Samsung multi-color variants proposal.

---

### Applied Dedicated Official Photo (SM-S931) for Samsung Galaxy S25 Base Models
- **Tarih:** 2026-08-30 21:52
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`
- **Yapılan Değişiklik:** Switched Samsung Galaxy S25 base model from shared S25 FE image to dedicated official manufacturer photo /images/phones/samsung/samsung-galaxy-s25-sm-s931.jpg.
- **Gerekçe:** User approved separating base S25 photo to ensure 100% distinct manufacturer original photography across all Samsung models.

---

### Applied Official Epey Studio Photos for 14 Samsung Models
- **Tarih:** 2026-08-30 22:06
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`, `public/images/phones/samsung/epey/`
- **Yapılan Değişiklik:** Replaced product images with canonical, clean transparent-background studio photos sourced directly from Epey (Galaxy S24 Ultra, S24+, S24, S23 Ultra, S22 Ultra, Z Fold 6, S25 Ultra, S25, S26 series).
- **Gerekçe:** User requested pulling official photos directly from Epey for gold-standard Turkish tech product presentation.

---

### Applied Official Epey Studio Photos for 17 Galaxy A Series Phones
- **Tarih:** 2026-08-30 23:27
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`, `public/images/phones/samsung/epey/`
- **Yapılan Değişiklik:** Replaced monotone light blue promotional images across the Galaxy A series with authentic, dual-angle neutral studio photos directly from Epey (A55, A35, A15, A05s, A54, A73, A23, A13, A72, A52s, A52, A12, A71, A51, A50, A30, A20).
- **Gerekçe:** User requested replacing monotone blue promotional renders with diverse, authentic Epey dual-angle studio product photography.

---

### Applied Comprehensive Official Epey/Samsung Studio Photos for 10 Galaxy Z, S, Note, and M Models
- **Tarih:** 2026-08-30 23:44
- **Etkilenen Dosyalar:** `src/lib/smartphonesData.json`, `public/images/phones/samsung/epey/`
- **Yapılan Değişiklik:** Connected high-res, verified manufacturer studio photography directly from Epey for Galaxy Z Fold 5, Z Fold 4, Z Flip 3, S24 FE, S22+, S22, S20 FE, Note 20 Ultra, M35 5G, M34 5G, M33 5G, M13.
- **Gerekçe:** User requested comprehensive overhaul of all Samsung smartphones to eliminate generic/repetitive photos.

---
