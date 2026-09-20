import type { ComparisonPanelData, TechNewsPanelData } from './resolvers';

export const INSUFFICIENT_COMPARISON = 'Genel kazananı belirlemek için yeterli doğrulanmış karşılaştırma verisi yok.';

type PricedItem = { price?: number | null; currentPrice?: number | null; priceStatus?: string; statusLabel?: string };
export function describeChatPrice(item: PricedItem): string {
  const amount = typeof item.price === 'number' && Number.isFinite(item.price) && item.price > 0
    ? `${item.price.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok';
  const label = item.priceStatus === 'fresh' && item.currentPrice != null
    ? 'Güncel Fiyat' : item.priceStatus === 'stale'
      ? item.statusLabel || 'Son görülen fiyat' : 'Katalog Referans Fiyatı — Fiyat doğrulanmadı';
  return `${amount} (${label})`;
}

/** Deterministic catalogue explanation: no benchmark, lab or overall-winner inference. */
export function buildCatalogChatReply(
  panel?: ComparisonPanelData | TechNewsPanelData | null,
  recommendations: (PricedItem & { productName?: string })[] = [],
  notice?: string,
): string {
  if (notice) return `[SUMMARY_CHAT]\n${notice}\n[/SUMMARY_CHAT]`;
  if (panel?.type === 'comparison') {
    const names = panel.products.map(p => p.name).join(' ile ');
    const prices = panel.products.map(p => `• **${p.name}:** ${describeChatPrice(p)}`).join('\n');
    const differences = panel.matrix.filter(row => row.isDifferent && row.key !== 'price').slice(0, 8)
      .map(row => `• **${row.label}:** ${panel.products.map((p, i) => `${p.name}: ${row.values[i] || 'Bilinmiyor'}`).join('; ')}`).join('\n');
    return `[VOICE_SUMMARY]\n${names} için katalog kayıtlarını yan yana getirdim. Genel kazanan için doğrulanmış karşılaştırma verisi yeterli değil.\n[/VOICE_SUMMARY]\n[SUMMARY_CHAT]\n**${names}** karşılaştırması hazır. ${INSUFFICIENT_COMPARISON} Bu durum beraberlik anlamına gelmez. Tablodaki sayısal farklar tek başına performans, kamera kalitesi veya kullanım süresini kanıtlamaz.\n[/SUMMARY_CHAT]\n[DEEP_ANALYSIS]\n### Katalogda kayıtlı farklar\n${differences || 'Karşılaştırılabilir kayıtlı fark bulunamadı.'}\n\n### Fiyat durumu\n${prices}\n\nKatalog alanları bağımsız donanım testi değildir. Ürün detay bağlantıları mağaza teklifi yerine katalog sayfasını açar. Önceliğin ekran boyutu, depolama veya ağırlık gibi belirli bir özellikse o satırı birlikte değerlendirebiliriz.\n[/DEEP_ANALYSIS]`;
  }
  if (recommendations.length) return `[SUMMARY_CHAT]\nKatalogda inceleyebileceğin modeller:\n${recommendations.map(p => `• **${p.productName || 'Ürün'}:** ${describeChatPrice(p)}`).join('\n')}\n\nYalnızca güncel teklifli ürünlerin bütçeye uygunluğu değerlendirilebilir. Diğer fiyatlar satın alma teklifi değildir.\n[/SUMMARY_CHAT]`;
  if (panel?.type === 'news') return '[SUMMARY_CHAT]\nPaneldeki bağlantıları kaynakları ve tarihleriyle inceleyebilirsin. Güncellikleri bu görüşmede ayrıca doğrulanmadı.\n[/SUMMARY_CHAT]';
  return '[SUMMARY_CHAT]\nŞu anda ayrıntılı yanıt hizmetine ulaşamıyorum. Katalog karşılaştırması için iki tam model adı ve varsa depolama kapasitesini yazabilirsin. Bütçe önerilerinde yalnızca doğrulanmış güncel teklifleri esas alırım. 🐧\n[/SUMMARY_CHAT]';
}
