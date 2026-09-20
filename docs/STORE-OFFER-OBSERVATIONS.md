# Mağaza teklif gözlemleri

Eski gece araçları arama sonucunun ilk benzer modelini seçiyor, HTML içindeki herhangi bir sayıyı fiyat kabul edebiliyor ve stok için kanıtsız `true` yazabiliyordu. `nightlyPriceSync.js` ve `syncAllCatalogs.js` artık aynı gözlem aracına yönlenir. `--push` kabul edilmez. Paket komutları ve GitHub gece görevi varsayılan olarak yalnız rapor üretir; otomatik commit/push yoktur.

## Kullanım

```sh
node scripts/observeStoreOffers.cjs --all --report=scratch/store-offer-report.json
```

Katalog dosyaları değişmez. Her giriş ya `observed` ya da açık gerekçesiyle `unverified` olur. Sıfır kaynak veya doğrulanamayan kaynak varsa çıkış kodu sıfır değildir. HTTP 200 tek başına fiyat başarısı değildir. Engel aşma, CAPTCHA çözme veya başka mağaza URL'sine sessiz geçiş yapılmaz.

Kaynağı ve sonucu incelenmiş bir yerel güncelleme için:

```sh
node scripts/observeStoreOffers.cjs --all --apply --report=scratch/store-offer-apply-report.json
```

Bu komut kaynakları yeniden okur; eski raporu yeni kontrol gibi içe aktarmaz. Yalnız başarılı gözlemin kendi mağaza teklifini ve stokta ise kaynaklı geçmiş fiyat noktasını yazar. Başarısız kontrolde eski fiyat ve `lastCheckedAt` korunur. `basePrice`, teknik özellikler, değerlendirmeler, görseller ve diğer mağazalar değişmez. Yerel değişiklikler ayrıca gözden geçirilip yayınlanmalıdır; bu araç yayın yapmaz.

## Kabul edilen kanıt

- `data/store_offer_sources.json`: birebir katalog kimliği, katalog adı, kategori, marka, incelenmiş tam mağaza başlığı, mağaza SKU'su, varsa üretici parça numarası ve varyant kapsamı.
- Yalnız tanımlanmış mağazanın doğrudan HTTPS ürün URL'si. Arama, ana sayfa, yönlendirme ve farklı canonical URL kabul edilmez.
- Aynı Product kaydında tam başlık + SKU + marka ve belirtilmişse MPN eşleşmesi gerekir. Eksik kapasiteyi yaklaşık model benzerliği tamamlamaz.
- Tekil `Offer`, açık `TRY`, geçerli pozitif fiyat, yeni ürün durumu, satıcı, doğrudan URL ve açık stok durumu gerekir. `AggregateOffer`, birden fazla teklif, genel sayfa fiyatları veya taksit metinleri kabul edilmez.
- Fiyat kontrol tarihi ancak tam HTTP yanıtından sonra alınır; zaman aşımı 15 saniye, HTML sınırı 3 MiB. Yanıtın SHA-256 özeti ve ürün kimliği teklif kanıtında saklanır.
- Stok dışı/ön sipariş kaydı aktif teklif ve geçmiş fiyat noktası oluşturmaz. Aynı kaynağın stoklu eski kaydının yerine geçerek eski stok iddiasını kaldırabilir.
- Dokuz katalog biçimi desteklenir. Değişen dosyada eşzamanlı kullanıcı düzenlemesi görülürse yazılmaz; kaynak bekleyen karantina alanları ayrıca denetlenir.

## 20 Eylül 2026 gerçek kaynak denemesi

İki incelenmiş MSI Claw bağlantısı kayıtlıdır. Teknosa A1M-088TR isteği HTTP 403 döndü. Vatan A1M-089TR sayfasında tam ürün/SKU/MPN bulundu, fakat Product kaydında tekil Offer yoktu. **0 doğrulanmış teklif; katalogta fiyat veya tarih değişmedi.** Kaynak bağlantısının incelenmiş olması fiyat beslemesinin tamamlandığı anlamına gelmez.

Mağaza API adaptörleri halen arama/fiyat için tamamlanmış bir entegrasyon değildir. Hesap anahtarı girilmiş olması stok kanıtı sayılmaz; sekiz adaptör gözlem yapmadığı durumda `null` döndürür. Gerçek yetkili feed/API kurulumu ve daha geniş, incelenmiş kaynak listesi açık iştir.

## Doğrulama kapsamı

20 Eylül 2026 ek gözlem: [Vatan iPhone 17 Pro Max 256 GB Abis](https://www.vatanbilgisayar.com/iphone-17-pro-max-akilli-telefon.html), mağaza SKU 153500, üretici parça numarası MFYP4TU/A, **129.999 TRY / InStock**, tam HTTP yanıtı sonrası **2026-09-20T12:22:09.373Z**. Bu tek kaynak `--category=smartphones --apply` ile yerel kataloğa alındı (1 gözlem, 0 başarısız). Diğer iki MSI kaynağı bu çalıştırmada tekrar sorgulanmadı. Bu fiyat, 24 saat sonrasında güncel teklif sayılmaz; otomatik yayınlanan sürekli bir fiyat beslemesi kurulmuş değildir.

Varyantlı ürünlerde kayıt manifesti birebir katalog varyant kimliği, renk adı, mağaza başlığı ve MPN gerektirir. Teklif ve geçmiş kaydında varyant korunur. Detayda renk değişince başka renge ait fiyat/geçmiş/JSON-LD teklifleri kaldırılır. Model seviyesindeki liste/arama/sohbet fiyatı varyant etiketi taşır. Aynı mağazadaki eski arama URL'si yeni doğrulanmış teklifi gölgeleyemez. İlk gerçek teklif öncesindeki ürün `data/catalog_archives/iphone17-abis-offer-before-2026-09-20.json` içinde korunur; diğer 904 telefon, teknik/ticari referans alanları aynen kalır.

Gümüş ürün sayfası farklı canonical adresi verdiği için o sayfanın teklifi içeri alınmadı; canonical kuralı gevşetilmedi. LG 27GX790A-B Vatan sayfasında görünen tutar ve “Stoktaki Mağazalar” düğmesi tekil çevrimiçi Offer kanıtı oluşturmadığından yeni fiyat olarak kaydedilmedi.

`test-observed-store-offers.cjs` sentetik HTML/HTTP yanıtlarıyla parser, kimlik, fiyat, stok, hata ve izole dosya yazımını sınar. `test-observed-pricing-integration.tsx` gerçek fiyat değerlendiricisi, geçmiş filtresi ve React sunucu çıktısını kullanır. Bunlar gerçek mağaza entegrasyonunu veya tarayıcı testini taklit ederek başarılı göstermemelidir. Gerçek kaynak denemesi ayrı raporlanır.
