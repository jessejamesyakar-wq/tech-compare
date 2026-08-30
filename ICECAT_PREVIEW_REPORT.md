# 📦 Icecat Açık Katalog Entegrasyon & Önizleme Raporu

Bu rapor, Icecat Open Catalog API entegrasyonu için hazırlanan ürün eşleşme ve onay taslağını içerir.

> [!IMPORTANT]
> **Güvenlik Kuralı:** Burada listelenen hiçbir görsel, kullanıcı tarafından açıkça onaylanmadan `smartphonesData.json` veya katalog dosyalarına yazılmaz.

---

## 📊 Özet İstatistikler
- **Taranan Örnek Ürün:** 90
- **Icecat Arama Anahtarı Hazır Ürün (GTIN / Parça Kodu):** 38
- **Manuel Fallback Gerektiren Ürün:** 52
- **Staging Dosyası:** `data/icecat_staging_preview.json`
- **Fallback Listesi:** `data/icecat_fallback_list.json`

---

## 🔍 Onay Bekleyen Eşleşme Önizlemeleri (Örnek Kesit)

| Kategori | Ürün Adı | Mevcut Görsel | Arama Anahtarı (GTIN / Kod) | Durum |
|---|---|---|---|:---:|
| **tvs** | LG 55QNED81B6A 55" 4K Ultra HD QNED Mini LED Smart TV (2026) | `/images/products/tvs/lg-55qned81b6a-1.jpg` | `Brand:LG Code:QNED` | ⏳ `PENDING_APPROVAL` |
| **tvs** | LG 65QNED816QA 65" 4K Ultra HD QNED Smart TV (2022) | `/images/products/tvs/lg-55qned81b6a-1.jpg` | `Brand:LG Code:QNED` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Max (18CPU/40GPU) (MGE94TU/A) Gümüş | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/40GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Max (18CPU/40GPU) (MGEE4TU/A) Siyah | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/40GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Pro (18CPU/20GPU) (MGE64TU/A) Gümüş | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/20GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Pro (18CPU/20GPU) (MGEC4TU/A) Siyah | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/20GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Max (18CPU/32GPU) (MGE74TU/A) Gümüş | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/32GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 16.2" M5 Max (18CPU/32GPU) (MGED4TU/A) Siyah | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/32GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 14.2" M5 Max (18CPU/32GPU) (MGDU4TU/A) Siyah | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/32GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 14.2" M5 Max (18CPU/32GPU) (MGDQ4TU/A) Gümüş | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/32GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 14.2" M5 Pro (18CPU/20GPU) (MGDT4TU/A) Siyah | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/20GPU` | ⏳ `PENDING_APPROVAL` |
| **laptops** | Apple MacBook Pro 14.2" M5 Pro (18CPU/20GPU) (MGDP4TU/A) Gümüş | `/images/products/laptops/apple-macbook-air-m3.jpg` | `Brand:Apple Code:18CPU/20GPU` | ⏳ `PENDING_APPROVAL` |
| **tablets** | Philips T7305 8" HD IPS 4G LTE 32GB Tablet | `/images/tablets/philips-t7305.jpg` | `Brand:Philips Code:T7305` | ⏳ `PENDING_APPROVAL` |
| **tablets** | Philips T7310 10.1" FHD IPS 4G LTE 4GB RAM 64GB Android Tablet | `/images/tablets/philips-t7310.jpg` | `Brand:Philips Code:T7310` | ⏳ `PENDING_APPROVAL` |
| **tablets** | Huawei MatePad 11.5 S (2026) 12 GB / 512 GB | `/images/products/tablets/huawei-matepad-11-5-s-2026-2-1.jpg` | `Brand:Huawei Code:2026` | ⏳ `PENDING_APPROVAL` |

---

## ⚠️ Manuel Fallback Gerektiren Ürünler (Örnek Kesit)

| Kategori | Ürün Adı | Marka | Neden |
|---|---|---|---|
| **smartphones** | Apple iPhone 17e (512 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17e (256 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17e (128 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone Air (1 TB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone Air (512 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone Air (256 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17 (512 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17 (256 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17 (128 GB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |
| **smartphones** | Apple iPhone 17 Pro Max (2 TB) | Apple | Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor. |

---

## 🚀 Sonraki Adım:
Icecat kullanıcı adınızı eklediğinizde, `node scripts/icecatPreviewSync.js` komutu tüm resmi Icecat yüksek çözünürlüklü görsellerini indirip staging tablosuna getirecektir. Siz onayladıktan sonra `node scripts/applyIcecatApprovedChanges.js` ile siteye uygulanacaktır.
