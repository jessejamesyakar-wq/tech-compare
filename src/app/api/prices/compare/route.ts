import { NextResponse } from 'next/server';
import { scrapeTargetStore, resolveStore, StoreKey } from '@/lib/scrapers/engine';

interface TargetItem {
  store?: StoreKey;
  url: string;
  affiliateUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targets = (body.targets || []) as TargetItem[];

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz hedef listesi. Lütfen en az bir mağaza URL hedefi belirtin.' },
        { status: 400 }
      );
    }

    const priceList = [];

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      if (!target.url) continue;

      const detectedStore = target.store || resolveStore(target.url);
      const result = await scrapeTargetStore(target.url);

      if (result.isValid && result.price) {
        priceList.push({
          store: detectedStore || result.store,
          price: result.price,
          inStock: result.inStock,
          title: result.title,
          url: target.affiliateUrl || target.url,
          lastUpdated: new Date().toISOString()
        });
      }

      // Son hedef değilse mağaza sunucularını boğmamak için rastgele gecikme (1.5sn - 2.5sn)
      if (i < targets.length - 1) {
        const sleep = 1500 + Math.floor(Math.random() * 1000);
        await new Promise((r) => setTimeout(r, sleep));
      }
    }

    // Fiyatları en ucuzdan en pahalıya sırala
    priceList.sort((a, b) => a.price - b.price);

    return NextResponse.json({
      success: true,
      count: priceList.length,
      cheapest: priceList[0] || null,
      prices: priceList
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Karşılaştırma hatası' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (url) {
    const result = await scrapeTargetStore(url);
    return NextResponse.json({ success: true, result });
  }

  return NextResponse.json({
    message: 'Epey Model Çoklu Mağaza Karşılaştırma API Aktif',
    supportedStores: [
      'hepsiburada', 'trendyol', 'amazon', 'n11', 'pttavm',
      'vatan', 'mediamarkt', 'teknosa', 'incehesap', 'itopya',
      'sinerji', 'gaminggen', 'gamegaraj', 'tebilon', 'ebrar'
    ]
  });
}
