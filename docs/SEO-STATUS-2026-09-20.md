# SEO çalışma durumu — 20 Eylül 2026

Codex, mevcut kaydedilmemiş Antigravity değişikliklerini koruyarak Aşama 3'ün
kalan sorunlarını doğrudan düzeltti. Commit, push veya canlı dağıtım yapılmadı.

## Bu çalışmada düzeltilenler

- Gizlilik, kullanım koşulları ve yasal uyarı sayfalarına kendilerine ait
  canonical adresleri eklendi. Öncesinde ana sayfanın adresini miras alıyorlardı.
- Ekrandaki fiyatlar ve Product JSON-LD aynı teklif seçicisini kullanıyor.
  Açıkça stokta olmayan, arama adresli, geçersiz fiyatlı veya 24 saati geçmiş
  teklifler güncel teklif olarak gönderilmiyor.
- Kanıtlı/görünür yorum kaynağı bulunmadığından aggregateRating yayınlanmıyor.
  Rastgele bir doğrulama bayrağı veya kaynak metni bu koşulu aşamıyor.
- İç katalog kimliği üretici parça numarası yerine kullanılmıyor. Ürünün
  sıfır olduğu varsayımı ve kaynaksız içerik güncelleme tarihleri kaldırıldı.
- JSON-LD içindeki metinler script etiketi oluşturamayacak şekilde kaçırılıyor.
- SEO açıklamalarındaki koşulsuz “canlı mağaza” ifadeleri temizlendi.
- SEO testi gerçek HTML/XML ayrıştırıyor; tüm kategorileri, canonical adresleri,
  kalıcı yönlendirmeleri, noindex/404 davranışlarını ve görsel yanıtlarını denetliyor.
- Test ürünleri benzersiz kimlikler kullanıyor. Temizlik yalnızca bu ürünleri
  siliyor, sunucudan 404 yanıtını ve yerel kataloğun korunmasını doğruluyor.

## Doğrudan çalıştırılan doğrulamalar

| Kontrol | Sonuç |
| --- | --- |
| Aşama 1 regresyonları | 48 başarılı, 0 başarısız |
| Aşama 2 fiyat/teklif kontrolleri | 61 başarılı, 0 başarısız |
| Katalog link ve kapasite kontrolü | 241 marka, 5.849 kayıt; 0 hata |
| Sitemap çözümleme | 5.848 tekil ürün adresi, toplam 5.862 URL |
| Geliştirme sunucusu SEO testi | 35 kontrol grubu, 83 HTTP isteği; başarılı |
| Yerel üretim sunucusu SEO testi | 32 kontrol grubu, 65 HTTP isteği; başarılı |
| Üretim derlemesi ve TypeScript | Başarılı |
| Üretimde test enjeksiyon adresi | HTTP 404 |

HTTP kontrolleri her kategoriden örnek ürünleri ve kritik rotaları kapsar;
tüm ürün sayfalarının tarayıcıda açıldığı anlamına gelmez. Katalogdaki bütün
ürün adresleri ayrıca gerçek ürün çözümleyicisiyle kontrol edildi.
Bu çalışmada Playwright görsel/etkileşim paketi yeniden çalıştırılmadı.

Testler:
- scripts/verify-seo-and-indexing.ts --unit-only: bileşen ve tüm sitemap çözümleme.
- scripts/verify-seo-and-indexing.ts: geliştirme sunucusunda ek HTTP entegrasyonu.
- scripts/verify-seo-and-indexing.ts --production: yerel üretim sunucusu kontrolleri.

TEST_BASE_URL yalnızca localhost/127.0.0.1/::1 hedeflerini kabul eder.
Geliştirme entegrasyonunda mevcut TEST_INJECTION_KEY kullanılır; test anahtarı
bu dosyada veya test çıktılarında tutulmaz.

## Yayın durumu ve açık kapsam

Değişiklikler yereldir. Geçici üretim sunucusu doğrulamadan sonra kapatıldı.
Mevcut geliştirme sunucusu korundu. Canlı sitenin bu değişiklikleri içerdiği
iddia edilmiyor.

HP OMEN C12CSEA ve MSI Claw 088TR/089TR kaynak doğrulaması bu SEO çalışmasının
kapsamında tamamlanmadı; mevcut unverified durumları korunuyor.
