# Teknik özelliklerin görünmemesi — 20 Eylül 2026

Kullanıcının bildirdiği sayfa:
`/compare?d1=redmi-k90-pro-max-5g-512-gb&d2=samsung-galaxy-s25`.
Bu çalışma, tamamlanmış gece denetiminden sonra kullanıcının yeni bildirimiyle
başlatıldı. Gece otomasyonu yeniden açılmadı; commit/push/deploy yapılmadı.

## Kök neden ve düzeltme

905 telefonun 477'si iki eski düz alan biçiminden birini kullanıyordu.
`ram`, `storage`, `chipset`, `batteryCapacity`, string `processor/battery`
gibi alanlar mevcutken karşılaştırma yalnız `memory.ramGb`,
`processor.chip`, `battery.capacitymAh` gibi iç içe alanları okuyordu.
Sonuç: bütün teknik satırlar bilinmiyor ve özet yanlış biçimde
"Teknik özellik kaydı yok" diyordu.

İkinci kayıp noktası gerçek tarayıcıda bulundu: `toCatalogProduct`, listeye
aktarırken eski alanları tamamen siliyordu. Bilinen küçük scalar alanlar
artık korunuyor; bütün ağır ürün nesnesi listeye taşınmıyor.

- `src/lib/smartphoneSpecFields.ts`: iki eski biçim ve mevcut biçim için
  ortak okuyucu. Sayı, metin, false ve sıfır korunur; nesne/NaN/Infinity/boş
  metin özellik diye gösterilmez. Aralıklar tek sayıya çevrilmez.
- `src/lib/comparisonEvidence.ts`: telefon satırları ortak okuyucudan gelir.
  Eski alandan okunan sayı dahil bu değerler üstünlük hesabına katılmaz.
  Birleşik arka kamera açıklaması tek ana kamera sensörü diye sunulmaz.
- `CompareVerdictCard`, `DuelArena`: eski kayıtların kaynak doğrulaması
  beklediği açık gösterilir; gerçek boş kayıt hâlâ boş durumunu gösterir.
- `SpecSheet`, `BentoFeatureCards`, `PhoneDetailClient`: detay tablosu,
  özet ve kısa kutular aynı veriyi okuyabilir.
- `CompactProductCard`, `data.ts`: liste aktarımı ve kart aynı alanları
  korur; "128 GB GB" gibi yinelenen birim üretmez.

## Kaynak düzeltmeleri ve açık doğrulama

İki tam Galaxy S25 kaydı, **S25 Plus/Ultra ile karıştırılmadan**, resmi
[Samsung lansman teknik tablosu](https://news.samsung.com/global/samsung-galaxy-s25-series-sets-the-standard-of-ai-phone-as-a-true-ai-companion)
ve [Samsung ekran özellikleri](https://www.samsung.com/my/smartphones/galaxy-s25/specs/)
ile düzeltildi: FHD+ 2340×1080, 10 MP 3x telefoto, 25 W, 162 g,
7,2 mm, alüminyum kasa, Bluetooth 5.4, 128/256/512 GB seçenekleri.
Kaynaksız PPI, AnTuTu ve DxO sayıları kaldırıldı. Güncel yazılım sürümü
iddiası yerine çıkış sürümü yazıldı. Alan bazlı kaynaklar kaydedildi.

Redmi K90 Pro Max'in çıkış yılı 2027'den 2025'e,
[Xiaomi üçüncü çeyrek raporundaki Ekim 2025 lansmanı](https://ir.mi.com/static-files/1e19fb17-dc12-4803-8426-376008c467a9)
esas alınarak düzeltildi. Kimliğindeki eski 2027 eki bağlantıları korumak
için değiştirilmedi.

**Redmi'nin diğer özellikleri doğrulanmış değildir.**
[Üreticinin teknik sayfası](https://www.mi.com/prod/redmi-k90-pro-max/specs)
hem web okuyucuda hem gerçek tarayıcıda ürün teknik içeriğini yüklemedi.
Eski 144 Hz/6500 mAh/120 W/2 nm/Android 17 gibi kayıtlar doğrulanmış
özellik iddiası olarak kabul edilmedi; arayüzde kaynak bekleyen katalog
verisi olarak gösterilir ve kazanan hesabına girmez. Bu kayıt ve diğer
eski kayıtların kaynak denetimi ayrıca tamamlanmalı. **477 kayıt okunabilir
hale geldi demek, 477 modelin bütün bilgilerinin doğrulandığı anlamına gelmez.**

Orijinal üç kayıt `data/catalog_archives/s25-redmi-spec-report-2026-09-20.json`
içinde korundu. Tek seferlik değişiklik aracı diğer 902 kaydın, bütün ürün
kimliklerinin, fiyatların ve mağaza tekliflerinin değişmediğini assert etti.

## Çalıştırılan doğrulamalar

- `test-phone-spec-compatibility.tsx`: **10 PASS**, fonksiyon + gerçek React
  sunucu render; 905 kayıt ve 477 eski kaydın liste projeksiyonu tarandı.
- `test-comparison-evidence.tsx`: **25 PASS**.
- `test-detail-evidence.tsx`: **21 PASS**.
- `test-catalog-listing-regressions.ts`: **33 PASS**.
- `test-asama1-regressions.ts`: **48 PASS**, kaynak düzeltmesi ve ilk ortak
  okuyucu değişikliğinden sonra; son liste projeksiyonu sonrasında tekrar
  çalıştırıldığı iddia edilmiyor.
- Son `npm run build`: **exit 0**, TypeScript ve pre-deploy başarılı.
  5820 ürün korunuyor; önceki **6 ortak görsel uyarısı** sürüyor.
  Workspace log: `work/phone-spec-compatibility-projection-build.log`.
- `git diff --check`: geçti.

### Gerçek tarayıcı kanıtı (birim testlerinden ayrı)

- Kullanıcının gerçek URL'sinde önce Redmi boş özet ve bilinmeyen alanlar,
  S25'te yanlış 3080×1440 / 50 MP 5x / 45 W / 219 g görüldü.
- Son sürümde Redmi özet artık boş değil, 512 GB korunuyor, uyarı var;
  S25 ekran/telefoto/şarj/ağırlık düzeltmeleri gerçek DOM'da görüldü.
- Son karşılaştırma DOM ölçümleri: 360 px **353/353**, 390 px **383/383**,
  430 px **423/423**, masaüstü 1440 px **1433/1433** (client/scroll width).
  Mobil 390 ve masaüstü 1440 özellik kartları screenshot ile incelendi.
- 390 px Redmi detayında kısa RAM/batarya kutuları, kaynak uyarısı,
  teknik tablo ve özet değerleri gerçek DOM/screenshot üzerinden kontrol edildi.
- Son build sonrası `/phones` aramasına gerçek klavye girdisiyle Redmi adı
  yazıldı. Kartın ekran/işlemci/512 GB metni ve kaynak uyarısı DOM'da
  okundu, mobil screenshot incelendi. Önceki build'de burada veri kaybı
  görüldüğü için `toCatalogProduct` düzeltmesi ayrıca yapıldı.
- Geçici doğrulama sekmesinin son konsol hata kaydı boştu. Ekran boyutu
  normale döndürüldü, geçici sekme kapatıldı, kullanıcının karşılaştırma
  sekmesi yeniden yüklenip açık bırakıldı.

Güncel yerel üretim önizlemesi `http://127.0.0.1:3001` adresinde çalışıyor
(bu tur başlatılan oturum 10663). Önceki önizleme oturumları güvenli
biçimde kapatıldı; localhost:3000 veya kullanıcı yönetim belleği sıfırlanmadı.
