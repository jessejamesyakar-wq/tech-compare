# Sürekli iyileştirme — kabul koşulları ve ilerleme

Başlangıç: 20 Eylül 2026. Kullanıcı açık işleri tamamlayana kadar sürdürmeyi istedi.
Bu kayıt gece otomasyonundan ayrıdır; eski gece otomasyonu yeniden açılmadı.
Aktif çalışma hedefi oluşturuldu. Commit/push/deploy yetkisi bu hedefe dahil değildir.

## Tamamlanma koşulları

- [ ] Katalog teknik bilgilerindeki bilinen çelişkiler çözülmüş; doğrulanan alanların kaynakları, model/bölge/varyant kapsamı ve kontrol tarihi kayıtlı.
- [ ] Ürün görsellerindeki başlangıçtaki 6 yol uyarısı ve içerik taramasının açığa çıkardığı gruplar incelenmiş; yanlış model görselleri düzeltilmiş, meşru varyant ortaklıkları belgeli.
- [ ] Gerçek doğrudan teklifler tam SKU, stok, fiyat ve gözlem tarihiyle besleniyor. Başarısız kontrol tarihi yenilemiyor. Güncel olmayan veri canlı sayılmıyor.
- [ ] Hatalı içe aktarma/sentetik özellik üreticileri ele alınmış; bilinen veri hatalarının tekrarı yakalanıyor.
- [ ] Ana kullanıcı akışları masaüstü ve mobilde çalışıyor; fiziksel cihaz/200% metin/reduced-motion kontrolleri ayrı belgeli.
- [ ] Son sürümün ilgili regresyonları, derlemesi ve gerçek tarayıcı kontrolleri başarılı; açık kritik bulgu yok.
- [ ] Yayın öncesi değişiklik incelemesi ve yetkili bakım akışları tamam. Canlı yayın ve sonrasındaki doğrulama ayrıca açık yayın talebine bağlı.

Bu koşullardan biri açıkken %100 tamamlandı denmeyecek. Tüm katalog için kaynak denetimi, metadata varlığıyla veya testlerin yeşil olmasıyla eş tutulmayacak.

## 1. tur — MSI/HP kaynakları ve ölçülebilir başlangıç

### Gerçek veri düzeltmeleri

- MSI Claw A1M-088TR: 512 GB / 16 GB / Ultra 7 155H / Windows 11 Home bilgileri [doğrudan Teknosa sayfasıyla](https://www.teknosa.com/msi-claw-a1m-088tr-intel-core-ultra-7-155h-7-16-gb-ram-512-gb-ssd-w11-home-fhd-120hz-el-oyun-bilgisayari-p-785374399) eşleştirildi.
- A1M-089TR: 1 TB varyantı [doğrudan Vatan sayfasıyla](https://www.vatanbilgisayar.com/msi-claw-a1m-core-ultra-7-155h-16gb-1tb-ssd-7inc-w11.html) eşleştirildi. Sayfanın outlet/tükenmiş veya fiyat bilgisi bu teknik kaynak doğrulamasından güncel teklife dönüştürülmedi.
- İki MSI kaydının ortak donanımı [MSI teknik sayfasıyla](https://www.msi.com/Handheld/Claw-A1MX/Specification) işlendi. Thunderbolt artık HDMI diye saklanmıyor. Kaynaksız HDR, sabit FPS ve TFLOPs kaldırıldı; azami RAM kurulu RAM sanılmadı.
- HP C12CSEA: [HP Türkiye teknik tablosuyla](https://www.hp.com/tr-tr/products/laptops/product-details/product-specifications/2103194386) RTX 5060, 1920×1200/144 Hz, 70 Wh, 2,44 kg ve bağlantılar düzeltildi; kanıtsız ölçümler kaldırıldı.
- **HP varyantı açık:** katalog başlığı 64 GB/W11P; üretici 32 GB/FreeDOS bildiriyor. Satıcının yükseltilmiş varyantını kanıtsız değiştirmek yerine uyarı eklendi. RAM sayısal olsa bile üstünlük üretemiyor; kaynaklanan diğer alanlar bağımsız kalıyor.
- Üç kaydın özgün kopyaları `data/catalog_archives/msi-hp-source-facts-2026-09-20.json` içine alındı. Diğer kayıtlar, kimlikler, fiyatlar, teklifler ve görseller değişmediği uygulama aracında doğrulandı.

### Gösterim ve koruma

- `specVerification` ile bilinen varyant uyuşmazlığını veriyle taşıyan alan eklendi; listeye aktarımda korunuyor.
- Ortak alan denetimi, çözümlenmemiş sayısal özelliklerin karşılaştırma kazananına dönüşmesini engelliyor.
- Laptop ve konsol detaylarında kapsam notlarıyla açılabilir kaynak bağlantıları var. Liste ve düelloda doğrulama bekleyen kayıt uyarısı görünür.

### Başlangıç sayımı

`scripts/audit-catalog-readiness.ts` yalnız kataloğu okur, uzaktaki mağazalara istek atmaz. `--write` yalnız rapor JSON'unu yazar. Snapshot: `CATALOG-READINESS-2026-09-20.json`.

20 Eylül 2026 11.00 TSİ ilk sayım:
- 5.820 ürün; yalnız **70 kayıtta alan bazlı kaynak metadata'sı** mevcut. Bu 70 ürünün tüm özelliklerinin doğrulandığı anlamına gelmez; bazı kaynaklar yalnız kategori/kimlik içindir.
- Bu katalog snapshot'ında uygulamanın güncel teklif koşullarını karşılayan ürün **0**. Bu sayı canlı mağazalarda hiç stok olmadığı anlamına gelmez; yerel kayıtlar yeterli kanıt taşımıyor.
- Telefonların 477'si bütünüyle eski düz biçimde; toplam 520'si en az bir eski alan kullanıyor (43 karma kayıt ayrıca mevcut).
- Kaynak metadata denetiminde tarih/bağlantı/eksik alan hatası 0; HP'de 1 açık varyant uyuşmazlığı.

### Testler ve kalan adım

- `test-msi-hp-source-facts.tsx`: 11 PASS; gerçek fonksiyonlar + React sunucu çıktısı.
- `test-comparison-evidence.tsx`: 25 PASS.
- npx TSX önbellek yazma izni hatası nedeniyle başlayamadı. Güvenli alternatif olarak önceki denetimde kullanılan yerel TypeScript çalıştırıcısı `work/run-repo-ts.cjs` ile testler yürütüldü; uygulama fonksiyonları taklit edilmedi.
- Telefon uyumluluğu 10, teklif kuralları 61, detay gösterimi 21, katalog listeleme 33 test geçti. Katalog bütünlüğü 5.820 ürün / 241 marka: 0 hata.
- Üretim derlemesi başarılı (exit 0); mevcut 6 ortak görsel uyarı grubu açık. `git diff --check` temiz.
- **Gerçek tarayıcı:** HP detayında 390 px genişlikte RAM/OS uyuşmazlığı ve açılan HP kaynak notu görüldü; yatay taşma yok (383/383). MSI 088 detayında 390 px kaynak bağlantıları açıldı, 512 GB / 16 GB / 53 Wh / 65 W doğru etiket ve birimlerle görüldü, taşma yok. Konsol ekranındaki ham STORAGEGB/RAMGB başlıkları bu kontrolde bulunup Türkçeleştirildi.
- **Gerçek masaüstü tarayıcı:** MSI 088/089 düellosunda 512 GB / 1.024 GB ayrımı, eşit RAM ve genel kazanan için yetersiz veri mesajı görüldü. 1440 px görünümde taşma yok (1433/1433), konsol hata kaydı yok. Bunlar fiziksel telefon kontrolü değildir.

Sonraki adım: Redmi üretici sayfasındaki sınırlı doğrudan kanıtı işleyip kalan alanları açık tutmak; ardından yanlış görsel grupları. Mağaza veri altyapısı ayrı bir iş paketi olarak sürüyor.

## 2. tur — Redmi kısmi kaynak düzeltmesi ve görsel kök nedenleri

- [Xiaomi üretici teknik sayfası](https://www.mi.com/prod/redmi-k90-pro-max/specs) HTTP 200 döndü. Dinamik teknik tablo gelmedi, fakat HTML başlığı ve açıklaması açıkça K90 Pro Max / 6,9 inç / 7560 mAh / IP68 içeriyor. Ekran 6,78→6,9, batarya 6500→7560 düzeltildi. Bunlar Çin modelinin özellikleridir; Türkiye SKU'su ve kalan teknik alanlar doğrulanmadı.
- Kaynaksız pazarlama vurguları ve editoryal artı/eksi listeleri temizlendi. Eski alanların tümü doğrulanmış sayılmadı; RAM/işlemci/OS/kamera vb. açık bırakıldı. `ProductSpecSources` telefon detayına bağlandı. Kaynak ve açık alan notları kullanıcı tarafından görülebilir.
- Özgün kayıt `data/catalog_archives/redmi-source-facts-2026-09-20.json` içinde; kimlik, kapasite başlığı, mağaza/fiyat verisi ve diğer ürünler korunuyor. `test-redmi-source-facts.tsx`: **7 PASS**; telefon uyumluluğu **10 PASS**, karşılaştırma **25 PASS**; katalog bütünlüğü 5.820 kayıtta 0 kırık link/kapasite sapması.

### Beş Samsung görseli düzeltildi

- M51, M52, M53, M54, M55 başka bir M35 görselini kullanıyordu. Aynı model isimli alternatif yerel JPG'ler de aynı M35 fotoğrafıydı; yalnız dosya adına güvenilmedi.
- M51 için [Samsung Newsroom](https://news.samsung.com/mx/samsung-mexico-presenta-galaxy-m51-con-una-bateria-de-7000-mah), diğer dört ürün için üreticinin tam model sayfalarındaki görseller indirildi ve görsel olarak incelendi. Kaynak URL, dosya özeti, kapsam ve tarih `data/catalog_image_sources.json` içinde. Yalnız görseller değişti; özgün kayıtlar arşivlendi.
- M52/53/54/55 resmi küçük ürün görselleri 330×330; özellikle M55 için daha yüksek kaliteli üretici görseli hâlâ arzu edilir. Kaynaklı olmak tüm görsel kalite kriterlerinin tamamlandığı anlamına gelmez.
- `preDeployCheck.js` artık incelenmiş görselin yanlış model yolu veya değişmiş dosya içeriğiyle değiştirilmesini yakalıyor. `test-catalog-image-evidence.cjs`: **6 PASS** (kimlik, değişmemiş ticari alanlar, dosya içeriği, yol sınırı, kaynak URL, emekliye ayrılan araçlar).
- Hatanın kök nedenleri bulundu: `assignAllUniquePhonePhotos.js`, `fixAllCrossBrandImages.js`, `fixBrokenPaths.js` farklı modelleri/markaları gelişigüzel birbirine eşliyordu. Bu üç eski araç veri veya ağ erişiminden önce açık hata vererek duruyor; eski içerik denetim kanıtı olarak dosyada korundu.

### Yeni önemli açık bulgu: 6 yol uyarısından daha geniş kapsam

`scripts/audit-catalog-image-content.ts` birincil görselleri SHA-256 içeriğine göre tarıyor; hiçbir katalog verisini değiştirmiyor. Tam çıktı `docs/CATALOG-IMAGE-CONTENT-2026-09-20.json`.

- 5.820 üründe 5.585 yerel görsel dosyası; **526 ortak içerik grubu**, bunların **418'i farklı dosya yollarında aynı baytları** taşıyor. Bu sayılar hata sayısı değildir: aynı kasanın depolama varyantlarının aynı fotoğrafı kullanması meşru olabilir.
- En büyük grup **171 telefon kaydında aynı eski MetroPCS logolu telefon fotoğrafı**; Huawei Y5ii ve Mate 40 RS gibi farklı modeller dahil. Yerel görsel açılarak teyit edildi. Bu ciddi veri kalitesi sorunu henüz çözülmedi.
- Mikser/airfryer vb. ürünlerde Philips su ısıtıcısı fotoğrafı, Samsung saatlerde başka neslin fotoğrafı ve Apple saat renk/kordon uyuşmazlıkları açık. Başlangıçtaki 6 yol grubunun yalnız Samsung M grubu kapandı; 5 kaldı. Dosya yoluna bakan önceki kontrol bu genişliği yakalayamıyordu.
- Son fiyat/kaynak sayımı: 70 alan kaynaklı kayıt (tam doğrulanmış ürün sayısı değil), 2 açık alan notu (HP varyantı ve Redmi kalan alanları), 0 kaynak metadata hatası, 0 uygun güncel teklif.

### Turun tamamlanmayı bekleyen kontrolü

Yeni testte eski `pros/cons` alanlarına ilişkin TypeScript tip hatası ilk üretim derlemesini durdurdu; testin eski veri tipi açıkça tanımlanarak düzeltildi. Sonraki üretim derlemesi başarılı (exit 0), `git diff --check` temiz. Kaynak açıklamasından kullanıcıya gereksiz HTML/dinamik tablo ayrıntıları çıkarıldı; teknik erişim sınırı yalnız bu çalışma kaydında tutuluyor.

**Gerçek tarayıcı kontrolü:** Redmi detay 360×800 görünümünde 6,9 inç/7.560 mAh, doğru 512 GB başlık ve açılan iki kaynak bağlantısı görüldü; yatay taşma yok (353/353). M53 detay 430×900 görünümünde yeni Samsung üretici görseli gerçekten yüklendi (DOM'daki `complete=true`, yeni verified dosya yolu ve ekran görüntüsü ile); yatay taşma yok (423/423), tarayıcı hata kaydı yok. M51/52/54/55 görselleri yerel resim görüntüleyicide incelendi; bu dört modelin web sayfaları bu turda ayrıca tarayıcıda açılmadı.

**Ek açık veri çelişkisi:** M53'ün gerçek detay ekranı panel açıklamasında 120 Hz, ayrı yenileme alanında 90 Hz gösteriyor. Üreticiye bağlı olmayan Türkiye garantisi vurgusu, AnTuTu 750.000 ve DxOMark 118 kaydı da mevcut. Bu turda görseller düzeltildi; bu teknik alanlar düzeltilmiş sayılmıyor. Sıradaki veri paketine eklendi. Yapılı şema tek başına doğrulama kanıtı değildir; bu kontrol kaynak eksikliği korumasının yalnız eski/düz telefon verisiyle sınırlı kalmaması gerektiğini gösteriyor.

Sıradaki iş: büyük yanlış telefon görseli grubu ve ev aleti/saat yanlış eşlemelerini model kaynaklarıyla çözmek; 526 grubu tek kalemde doğru/yanlış ilan etmemek. Ardından diğer ithalat araçları, kategori teknik başlıkları ve gerçek teklif besleme. %100 tamamlanma iddiası yok; commit/push/deploy yapılmadı.

Son durum: sadeleştirilmiş kaynak açıklaması dahil son üretim derlemesi de **exit 0**; TypeScript başarılı, kırık link/yinelenen kimlik/veri kaybı yok. Beş yol bazlı görsel uyarısı ve içerik raporundaki incelenmemiş gruplar açık. Yerel önizleme `127.0.0.1:3001` son derlemeyle yeniden başlatıldı. Aktif hedef devam ediyor; eski gece otomasyonu yeniden açılmadı.

## 3. tur — Huawei görsel/teknik kaynakları ve M53 düzeltmesi

### Kaynaklı düzeltmeler

- Huawei Y5II: [Huawei Levant teknik tablosu](https://consumer.huawei.com/levant-ar/phones/y5ii/specs/) ile 5 inç HD IPS, 1 GB RAM, 8 GB depolama, 2200 mAh, 8 MP/2 MP kameralar ve 135 g düzeltildi. 3G/4G işlemcileri birine zorlanmadı. Kaynaksız şarj wattı, HarmonyOS/50 MP/5000 mAh pazarlama metinleri kaldırıldı. Kayıtlı çıkış yılı hâlâ açık; doğrulanmış sayılmıyor.
- Huawei Pura 70 Ultra: [Huawei Singapur](https://consumer.huawei.com/sg/phones/pura70-ultra/specs/) ile 6,8 inç, LTPO 1–120 Hz, 2844×1260, Kirin 9010, 5200 mAh, 100 W, 50+40+50 MP arka/13 MP ön kamera, 226 g ve IP68 düzeltildi. Kaynak 16 GB/512 GB/EMUI 14.2 bölgesel varyantı tanımlıyor. Katalogdaki 512 GB / 1 TB birleşik kayıt tek varyant diye daraltılmadı; RAM/depolama/OS eşleşmesi açık. Bu alanlar SEO açıklamasına ve üstünlük hesabına taşınmıyor.
- Huawei nova 11 Pro: [Huawei Portekiz](https://consumer.huawei.com/pt/phones/nova11-pro/specs/) ile 6,78 inç OLED 120 Hz, Snapdragon 778G 4G, 256 GB, 4500 mAh, 100 W, 50+8 MP arka/60+8 MP ön kamera ve 188 g düzeltildi. RAM kaynakta yazmadığı için tahmini 8 GB kaldırıldı. İki ön kamera tek bir 68 MP sensör yapılmadı.
- Samsung M53 5G: [Samsung Portekiz 8 GB/128 GB SM-M536BZBGEUB](https://www.samsung.com/pt/smartphones/galaxy-m/galaxy-m53-5g-blue-128gb-sm-m536bzbgeub/) teknik tablosu esas alındı. 120 Hz, 1080×2400, 8 MP ultra geniş/32 MP ön kamera, 176 g/7,4 mm, Wi-Fi a/b/g/n/ac ve Bluetooth 5.2 düzeltildi. Kaynaksız 750.000 AnTuTu, 118 DxOMark, LPDDR5X, 5 nm, parlaklık, garanti, Android 14 ve dört yıllık güncelleme iddiaları kaldırıldı. Kablosuz şarj/suya dayanıklılık yokluğu kanıtsız false olarak tutulmuyor.
- Alan kaynakları ve açık varyant notları katalogta. Üç Huawei modelinde bazı alanlar hâlâ eski düz şemada: okunabiliyor ama bu eski alanlar salt birim içeriyor diye karşılaştırma üstünlüğüne dönüşmüyor. Doğrulanmış tekil değerlerin yapılandırılmış biçime aktarılması sonraki paket konusu; 120 Hz gibi doğrudan kaynaklanan yapılandırılmış alanlar kullanılabiliyor.

### Görseller ve yanlış veri üretiminin kökü

- Üç Huawei üretici görseli yerel görüntüleyicide incelendi: Y5II teknik çizimli siyah görünüm; Pura 70 Ultra ve nova 11 Pro yeşil arka görünüm. Dosyalar `public/images/phones/huawei/verified/` altında. Renk, Türkiye satıcı SKU'su veya stok için kanıt sayılmadı.
- `data/catalog_image_sources.json` artık **8 incelenmiş görsel** ve **168 açık görsel kaydı** içeriyor. Aynı eski MetroPCS telefonunu gösteren kalan 168 modelde bu fotoğraf yerine açık doğrulama alanı var. Bunlar düzeltilmiş/fotoğrafı tamamlanmış modeller sayılmıyor.
- Özgün 171 Huawei + M53 kayıtları, ticari bilgiler dahil `data/catalog_archives/huawei-m53-source-facts-2026-09-20.json` içine alındı. Kimlik, slug, ad, ticari fiyat, mağaza teklifi, geçmiş fiyat, puan ve çıkış yılı değişmedi. Veri kaybı yok; bu alanların korunması doğru oldukları anlamına gelmez.
- Placeholder SEO ürün fotoğrafına dahil edilmiyor; sosyal önizlemede site simgesi kullanılıyor. Ürün görseli bileşeninde uyarı gerçek metin ve ekran okuyucu etiketiyle gösteriliyor, galeri bu alan için fotoğraf büyütme düğmesi sunmuyor.
- Üç ek eski araç durduruldu: `buildCompleteHuaweiCatalog.js` model isminden tahmini özellik/fiyat ve rastgele puan/yorum üretiyordu; `enrichHuaweiCatalog.js` kaynaksız fiyat/stok/yorum yazıyordu; `downloadAndLocalizeImages.js` hata halinde ilgisiz kategori fotoğrafını atıyordu. Altı emekliye ayrılmış araç dosya/ağ erişiminden önce açık hata veriyor.
- Yeni koruma yanlış fotoğrafın galeri/renk varyantından geri sokulmasını ve kaynak bekleyen kaydın sessizce kaybolmasını yakalıyor. Derleme raporu 168 bekleyen fotoğrafı açık uyarı sayıyor.

### Kod ve kontroller

- Değişen ortak kod: `smartphoneSpecFields.ts`, `data.ts` (telefon liste projeksiyonu artık karma kaydın tanımlı düz ve iç içe alanlarını koruyor); `seoHelper.ts`, `ProductJsonLd.tsx`, yeni `productImages.ts`; `ProductImage.tsx`, `ProductImageGallery.tsx`; görsel kanıt denetimi ve pre-deploy kapısı.
- Kaynak testleri **8 PASS**, görsel kanıt testleri **7 PASS**, telefon şema/gösterim **10 PASS**, karşılaştırma mantığı **25 PASS**. 5.820 ürün / 241 marka gerçek çözümleyicide 0 kırık link/kapasite sapması.
- Son üretim derlemesi **exit 0**, TypeScript başarılı, `git diff --check` temiz. İlk başarılı derlemeden sonra gerçek mobil kontrolde bulunan 120 Hz boş alanı ve küçük placeholder metni düzeltildi, son derleme yeniden alındı.
- **Gerçek tarayıcı:** nova 11 Pro 390 px (383/383) doğru üretici fotoğrafı, RAM bilinmiyor ve 100 W görüldü. Mate 40 RS 360 px (353/353) açıklamalı görsel alanı görüldü; büyütme düğmesi yok. M53 430 px (423/423) 120 Hz, 176 g, kaynak açıklaması ve kanıtsız puanların yokluğu görüldü. Nova/M53 1440 px (1433/1433) doğru iki model/görsel, 120/120 Hz eşitliği, RAM yetersiz veri, genel kazanan yok durumu görüldü. Hata konsolu boş. Bunlar fiziksel cihaz testleri değildir.
- Önizleme son derlemeyle `127.0.0.1:3001` üzerinde. Geçici tarayıcı sekmesi kapatıldı, viewport sıfırlandı; kullanıcı sekmelerine ve 3000 sunucusuna dokunulmadı.

### Güncel açıklar ve sıradaki iş

- Snapshot: 5.820 ürün, **74 alan kaynak metadata kaydı**, 6 açık alan notu, 0 metadata biçim hatası. Tam doğrulanmış ürün sayısı değildir. 520 telefonda eski alan var; bunların 475'i tamamen düz şemada. Yerel katalogda uygun güncel/eski doğrudan teklif 0.
- Görsel bayt taraması: 526 tekrar grubu, 417 farklı yolda ortak içerik grubu; en büyük grup artık açık uyarı alanını kullanan 168 kayıttır. Diğer gruplar doğru/yanlış diye topluca sınıflandırılmadı.
- **Önemli kalan veri borcu:** eski Huawei üreticisinin tahmini teknik/pazarlama/fiyat kayıtları kalan modellerde hâlâ duruyor. Örneğin Mate 40 RS sayfasında eski 2100 mAh/1–2 GB ve başlık vurguları çelişiyor; 2.479 TL yalnız referans etiketiyle görülüyor, fakat referansın da gerçek gözlem kanıtı yok. Bu paket yalnız üç Huawei ve M53 teknik kaydını düzeltti. Kalan veriyi temizlenmiş saymıyoruz. Sıradaki öncelik bu sentetik fiyat/özellik kökenini alan düzeyinde ele almak ve üreticinin tam model kaydıyla doldurmak; açıkça hatalı kaydı referans etiketiyle bırakmak kalıcı çözüm değil.
- Y5II çıkış yılı/3G–4G kimliği, Pura bölgesel varyantı, nova RAM, HP 64 GB satıcı varyantı, Redmi kalan alanları açık. Ev aleti/saat yanlış görselleri ve gerçek mağaza veri beslemesi devam ediyor.
- Sayfa ilk SSR içeriğini gösterdikten sonra kısa süre `Ürün yükleniyor...` ekranına dönüyor; tekrar yükleme görüntüsü tarayıcıda gözlendi. Kaynak doğrulama paketi kapsamında değiştirilmedi; sonraki performans/deneyim incelemesine alındı.

Hedef aktif. Commit/push/deploy yapılmadı; %100 tamamlanma iddiası yok.

## 4. tur — Tahmin verilerinin karantinaya alınması ve yayın hazırlığı

- 396 Huawei kaydının 393'ünde dokuz teknik alanın tamamı `buildCompleteHuaweiCatalog.js` içindeki model-adı şablonuyla birebir eşleşti. Üç önceden kaynaklanmış model bu gruptan ayrıdır. Orijinal 396 kayıt `data/catalog_archives/huawei-generated-data-2026-09-20.json` içinde korunuyor.
- Tahmini teknik alanlar, kaynaksız pazarlama iddiaları, puan/yorum ve ticari gözlem kanıtı taşımayan fiyat/teklif/geçmiş kayıtları gösterimden çıkarıldı. Bu işlem ürünleri silmez. Ticari kayıtların hepsinin bağımsız olarak yanlış olduğu iddia edilmiyor; kanıt gelene kadar arşivde bekliyorlar.
- Pura 70 Pro, Huawei Singapur teknik tablosuyla kaynaklandı: Kirin 9010, 6,8 inç LTPO 120 Hz, 12 GB/512 GB, 5050 mAh/100 W, 50+12,5+48 MP arka ve 13 MP ön kamera, 220 g. Resmî siyah arka görseli incelenip eklendi. Türkiye SKU/şebeke/eSIM eşleşmesi açık. `-1` son ekli belirsiz kayıt aynı model varsayılıp doldurulmadı.
- Pura 70 Ultra'nın şablondan gelen 512 GB / 1 TB birleşimi kaldırıldı; mevcut Huawei Singapur kaynağının 16 GB/512 GB/EMUI 14.2 kapsamı açık gösteriliyor.
- **392 ürünün teknik bilgisi hâlâ açık.** Boşluğu doğru göstermek, bu ürünlerin bilgi işini bitirmek değildir. 396 kayıttaki açık alanlar `catalog_data_reviews.json` içinde; pre-deploy kapısı bunların kaynaksız geri doldurulmasını engeller.
- Fiyat/puan/yorum/yıl türleri eksik veriyi destekliyor. Fiyat filtreleri bilinmeyeni ucuz saymıyor, fiyat sıralaması bilinmeyeni sona alıyor. Adından 2015 yılı türetme kaldırıldı; P60 Pro gibi modellerin P6 alt dizisine takılıp eski sayılması engellendi. Eski yıl tek başına satışın bittiği iddiası üretmiyor.
- Kullanılmayan PhoneCard/LaptopMediaMarktCard uyumluluk girişleri ortak karta bağlandı; bu eski bileşenlerdeki uydurma indirim/taksit/mağaza/fiyat/özellik kodu kaldırıldı. Tarayıcı uzantısı `/api/compare` yalnız güncel doğrudan stoklu teklif döndürüyor; referans fiyatı stokta teklif yapmıyor. Bu endpoint'in eski benzerlik eşleştirmesi ayrıca incelenecek.
- `scrape2026Prices.js`, `calibratePrices.js`, `syncBasePrices.js` dosya/ağ erişiminden önce durur: başarısız kontrolde fiyat üretme veya doğrulanmamış minimumu referansa dönüştürme yapamazlar. Gerçek teklif besleme işi hâlâ açık.

### Doğrulama

- Yeni karantina testleri 9 PASS; Huawei/M53 kaynak testleri 8 PASS; görsel 7 PASS; telefon şema uyumluluğu 10 PASS; karşılaştırma 25 PASS; fiyat kuralları 61 PASS; kategori listeleme 33 PASS; detay 21 PASS. 5.820 ürün/241 marka bütünlük kontrolünde 0 kırık link/kapasite sapması.
- Yayın öncesi ek kontroller: Aşama 1 exit 0; bakım erişimi 97, public API 41, mağaza sağlık 14, fiyat/tarih 32, geçmiş fiyat 40, sohbet kanıtı 20, yerel tercihler 24, iletişim/arama 14 PASS. Bu testler gerçek uygulama işlevleri/yerel bellek/SSR kontrolleridir; gerçek tarayıcı olarak raporlanmaz.
- Üretim derlemesi exit 0, TypeScript temiz; `git diff --check` exit 0. Açık veri/görsel uyarıları korunuyor.
- **Gerçek tarayıcı:** Pura 70 Pro 390 px (383/383), açılan kaynak ve fiyat bilinmiyor; Mate 40 RS 360 px (353/353), görsel doğrulama alanı ve teknik/fiyat bilinmiyor; iki modelin masaüstü düellosu 1440 px (1433/1433), eksik alandan/genel puandan kazanan yok. Konsol hatası yok. Fiziksel cihaz testi değildir.
- Güncel sayım: 5.820 ürün, 75 alan-kaynak metadata kaydı (tam doğrulanmış ürün sayısı değildir), 392 boş teknik kayıt, 82 tamamen eski düz şemalı telefon, 127 telefonda en az bir eski alan. 9 incelenmiş görsel / 167 açık görsel; 0 uygun güncel/eski doğrudan teklif.

### Kullanıcının yayın talebi

Kullanıcı 20 Eylül 2026 tarihinde “yapılanları canlıya aktarabilir misin?” diyerek mevcut düzeltmelerin yayınını açıkça istedi. Önceki commit/push/deploy yapılmaması kısıtı bu yayın için kalktı. Son yerel sürüm 3001 üzerinde hazır; GitHub main ve bağlı Vercel yayını hazırlanıyor. Canlı doğrulama henüz tamamlanmadı. Açık kaynak/veri işleri ve genel iyileştirme hedefi devam ediyor.
