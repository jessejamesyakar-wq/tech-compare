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

### 2. "+" Model Slug ve Teknik Özellik Ayrıştırması
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
