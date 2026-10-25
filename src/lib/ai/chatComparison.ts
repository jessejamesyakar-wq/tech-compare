// Small client-safe projection of the server's comparison event. Never imports the catalog.
export type ChatComparison = {
  products: { id: string; slug: string; name: string; image: string; category: string }[];
  rows: { key: string; label: string; values: string[]; different: boolean; leader: number | null }[];
};
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 500): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
const identifier = (v: unknown): v is string => text(v, 200) && /^[a-z0-9-]+$/i.test(v);
const categories = new Set(['phones', 'smartphones', 'tvs', 'laptops', 'tablets', 'headphones', 'smartwatches', 'monitors', 'consoles', 'appliances']);

export function parseChatComparison(value: unknown): ChatComparison | null {
  if (!record(value) || value.type !== 'comparison' || !Array.isArray(value.products) || value.products.length !== 2 || !Array.isArray(value.matrix)) return null;
  const products: ChatComparison['products'] = [];
  for (const p of value.products) {
    if (!record(p) || !identifier(p.id) || !identifier(p.slug) || !text(p.name, 350) || !text(p.category) || !categories.has(p.category)) return null;
    const category = p.category === 'smartphones' ? 'phones' : p.category;
    let image = '/images/product-placeholder.png';
    if (text(p.image, 2000) && /^\/(?!\/)[a-z0-9/_%. -]+\.(?:png|webp|jpe?g|avif)$/i.test(p.image)) image = p.image;
    else if (text(p.image, 2000)) {
      try { const url = new URL(p.image); if (url.protocol === 'https:' && !url.username && !url.password) image = url.href; } catch { /* Show an honest placeholder. */ }
    }
    products.push({ id: p.id, slug: p.slug, name: p.name, image, category });
  }
  if (products[0].id === products[1].id || products[0].category !== products[1].category) return null;
  const rows: ChatComparison['rows'] = [];
  for (const row of value.matrix.slice(0, 80)) {
    if (!record(row) || !text(row.key, 180) || !text(row.label, 180) || !Array.isArray(row.values) || row.values.length !== 2 || !row.values.every(v => text(v, 1500))) continue;
    // No price, historical price or unverified aggregate score enters this feature.
    if (['price', 'score', 'year'].includes(row.key) || rows.some(r => r.key === row.key)) continue;
    rows.push({ key: row.key, label: row.label, values: row.values as string[], different: row.values[0] !== row.values[1], leader: row.superiorIdx === 0 || row.superiorIdx === 1 ? row.superiorIdx : null });
  }
  return rows.length ? { products, rows } : null;
}

export type ComparisonPriority = 'general' | 'refreshRateHz' | 'hdmiPorts';
export function comparisonChatSummary(data: ChatComparison): string {
  const panel = data.rows.find(row => row.key.endsWith(':displayTech'));
  return `${data.products.map(p => p.name).join(' ile ')} için karşılaştırmayı açtım.\n\nFotoğraflar ve kayıtlı özellikler yan panelde.${panel ? ` Panel teknolojileri: ${panel.values.join(' / ')}.` : ''}\n\nRoboPengu’nun kararı bölümünde önceliğini seçebilirsin. Karşılaştırılabilir kayıtlı bir değer varsa hangi modelin o ölçütte önde olduğunu açıklayacağım. Genel görüntü kalitesi kazananı için ortak koşullarda doğrulanmış testler gerekir.`;
}

export function comparisonDecision(data: ChatComparison, priority: ComparisonPriority) {
  if (priority === 'general' || data.products[0].category !== 'tvs') return null;
  const row = data.rows.find(r => r.key.split(':')[1] === priority);
  if (!row) return null;
  const unit = priority === 'refreshRateHz' ? 'Hz' : 'adet';
  const numbers = row.values.map(value => {
    const match = value.match(new RegExp(`^(\\d+)\\s+${unit}$`, 'i'));
    return match ? Number(match[1]) : NaN;
  });
  if (numbers.some(n => !Number.isFinite(n) || n <= 0) || numbers[0] === numbers[1]) return null;
  const leader = numbers[0] > numbers[1] ? 0 : 1;
  // Require agreement with the server's missing/conflicted-field gate.
  return row.leader === leader ? { product: data.products[leader], row } : null;
}

export function televisionTechnology(value: string): { title: string; detail: string; url: string } | null {
  if (/bilinmiyor|doğrulama|tartışmalı/i.test(value)) return null;
  if (/oled/i.test(value)) return { title: 'Kendi ışığını üreten pikseller', detail: 'OLED, pikselleri ayrı ayrı kapatabilir. Bu yapı siyah sahnelerde ışık kontrolü sağlar; bu modelin parlaklık ve yansıma performansını tek başına göstermez.', url: 'https://www.lg.com/in/oled-tvs/2021/self-lit-pixels/' };
  if (/mini[ -]?led|neo qled/i.test(value)) return { title: 'Bölgesel arka aydınlatma', detail: 'Mini LED, küçük LED ışık kaynaklarıyla LCD paneli arkadan aydınlatır. Bölge sayısı ve kontrolü önemlidir; yalnız teknoloji adına bakarak parlaklık veya siyah seviyesi kazananı seçilmez.', url: 'https://www.samsung.com/ie/support/tv-audio-video/what-are-the-differences-between-the-samsung-tv-models/' };
  if (/qled/i.test(value)) return { title: 'Kuantum nokta renk katmanı', detail: 'QLED, arka aydınlatmayla birlikte kuantum nokta teknolojisini kullanır. QLED adı tek başına Mini LED veya bölgesel karartma bulunduğunu göstermez; bunlar modele göre kontrol edilir.', url: 'https://www.samsung.com/us/tvs/tv-buying-guide/what-is-qled-tv/' };
  return null;
}
