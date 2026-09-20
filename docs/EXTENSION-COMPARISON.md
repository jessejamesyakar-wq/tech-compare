# Tarayıcı uzantısı ürün eşleştirme sözleşmesi

`GET /api/compare?q=...`, mağaza başlığını `matchExtensionProduct` ile tüm katalog üzerinde çözümler. Tek bir model/varyant seçilebilirse, aynı kaydın yalnız güncel doğrudan stoklu tekliflerini döndürür. Sırf ucuz veya stoklu olduğu için başka ürün seçilmez.

- Model adı bütünüyle eşleşir. S2/S20, 13/13T, Pro/Pro Max/Pro+, Ultra, FE ve üretici kodu son ekleri korunur.
- Türkçe harf/büyük-küçük harf, harf-rakam boşluğu, bazı kategori açıklamaları ve `1 TB = 1024 GB` gösterim farkları desteklenir.
- Açık depolama ve RAM değerleri kayda uymalıdır. Kapasite başlık/spec çelişkisi eşleşme sayılmaz. Kapasitesi bilinen bir ürün için kapasitesiz başlıktan varsayılan varyant seçilmez.
- İki olası kayıt varsa katalog sırası, fiyat veya teklif varlığı kararı değiştirmez. Renk, aksesuar, yenilenmiş durum ve paket sözcükleri eşleşme sağlamak için atılmaz. Bilinmeyen satıcı başlıkları yaklaşık bir modelin fiyatını göstermez.
- 4G/5G ayrı tutulur; `has5G: false` doğrudan 4G kanıtı değildir. Eksik RAM, eSIM, ağ veya kapasite bilgisi tahmin edilmez.
- Tam katalog ID/slug açık bir ürün seçimi olarak desteklenir. Kısa adlara varsayılan kapasite veren URL alias sözlüğü mağaza başlığı çözümlemesinde kullanılmaz.

## Yanıtlar

Başarılı yanıttaki mevcut `match` alanları korunur. Ayrıca en düşük teklifin `lastCheckedAt` tarihi, `statusLabel: "Güncel Fiyat"` ve her mağaza satırının gözlem tarihi taşınır. Kontrol tarihi yalnız mevcut tekliften gelir, istek saatiyle yenilenmez. Yanıt `Cache-Control: no-store` kullanır.

`match: null` için `reason`:

| Değer | Anlam |
| --- | --- |
| `not_found` | Model/kapasite/başlık kayda uymuyor veya kanıt yetersiz. |
| `variant_required` | Kapasite, açık RAM veya ağ varyantı seçimi gerekiyor. |
| `ambiguous` | Başlık tek bir katalog kaydını belirlemiyor. |
| `no_fresh_offer` | Ürün çözüldü; koşulları sağlayan güncel teklif yok. |

Tek bir `q` parametresi gerekir. 3 karakterden kısa, 500 karakterden uzun, kontrol karakteri içeren veya yinelenen sorgular HTTP 400 döner. GET/OPTIONS CORS davranışı korunur.

## Doğrulama sınırı

`scripts/test-extension-comparison.ts` gerçek eşleştiriciyi, gerçek katalog örneklerini ve Next.js GET işlevini sınar. Teklifli olumlu senaryolar ayrı test süreci belleğindeki ürünlerle çalışır ve temizlenir; üretim kataloğuna yazılmaz. Bu, kurulu tarayıcı uzantısıyla uçtan uca mağaza testi değildir.

Yerel üretim sunucusu HTTP kontrolleri gerçek katalogla yapılır. Güncel teklif bulunmaması doğrulanmış bir satış fiyatı veya tüm mağazalarda stok yokluğu değildir. Mağaza verisi entegrasyonu ve uzantının mağaza sayfasındaki gösterim/gezinti davranışı ayrıca doğrulanmalıdır.
# İçerik betiği gösterimi — 20 Eylül 2026 yerel ek

- `extension/content.js` API metinlerini DOM `textContent` ile gösterir; ürün/mağaza adı HTML olarak çalıştırılmaz. Fiyat ve her mağaza satırı gerçek gözlem tarihiyle etiketlenir.
- API, ortak tarih ayrıştırıcısının ürettiği gözlem anını kanonik UTC biçiminde döndürür. İçerik betiği yalnız geçerli, gelecekte olmayan, en fazla 24 saatlik açık stoklu fiyatları gösterir. En erken satır süresi dolduğunda kutu kaldırılır ve tekrar sorgulanır.
- URL/başlık değişimi eski kutuyu kaldırır, eski isteği iptal eder ve geç gelen yanıtı nesil/kimlik denetimiyle reddeder. URL değişmiş ama başlık hâlâ aynıysa yeni başlık beklenir; aynı başlıklı meşru varyant gezintisinde kutu gösterilmeyebilir. Yaklaşık fiyat göstermek yerine belirsizlik korunur.
- Kapat/Escape, odağı önceki düğmeye döndürür. Kapalı kutu aynı sayfada rastgele DOM değişiminde açılmaz. 44 px kontroller, uzun metin sarma ve reduced-motion CSS vardır.
- `scripts/test-extension-widget.cjs`: 40 saf işlev testi. `test-extension-comparison.ts`: UTC anını koruma dahil 52 gerçek uygulama işlevi testi.
- `scripts/serve-extension-fixture.cjs` yalnız 127.0.0.1:4174 üzerinde gerçek içerik betiği/CSS dosyalarını kontrollü HTML ve taklit taşıma yanıtıyla sunar. Gerçek tarayıcıda gecikmiş yanıt, URL/başlık ayrımı, zararsız metin gösterimi, eski/geçersiz/teklifsiz yanıt, süre dolması, kapat/Escape ve arama gezintisi incelendi. 360/390/430/1440 px düzen kontrol edildi.
- Bu kontrol **kurulu uzantı, izole uzantı dünyası veya gerçek mağaza entegrasyonu E2E testi değildir**. Gerçek fiyat beslemesi ve satıcı başlık kapsamı hâlâ açık. Üretim kataloğuna test fiyatı yazılmadı.
