import { NextRequest, NextResponse } from 'next/server';
import { autoFetchAndSaveProductImage } from '@/lib/productImagePipeline';
import { saveAnomaly } from '@/lib/ai/learningHub';
import { sendTelegramNotification } from '@/lib/ai/telegramNotifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productId, productName, category, brand, failedSrc } = body;

    if (!failedSrc) {
      return NextResponse.json({ success: false, error: 'failedSrc parametresi zorunludur' }, { status: 400 });
    }

    console.warn(`[RoboPengu Watchdog] Kirik gorsel tespit edildi: ${failedSrc} (Urun: ${productName || productId || 'Bilinmiyor'})`);

    // 1. Gorsel onarimi (Icecat / Fallback Pipeline)
    let repairedImage = '';
    let isFallback = false;

    if (productId && productName && category) {
      try {
        const repairResult = await autoFetchAndSaveProductImage({
          id: String(productId),
          name: String(productName),
          category: String(category),
          brand: String(brand || ''),
        });
        repairedImage = repairResult.localPath || '';
        isFallback = repairResult.isFallback;
      } catch (err: any) {
        console.error('[RoboPengu Watchdog] Otomatik gorsel tamir hatasi:', err?.message);
      }
    }

    // 2. Anomali kaydi
    saveAnomaly({
      messageId: 'watchdog-img-' + Date.now(),
      userPrompt: `Kirik Gorsel: ${productName || productId || failedSrc}`,
      assistantResponse: repairedImage ? `Otomatik onarildi: ${repairedImage}` : 'Yedek gorsel devreye sokuldu.',
      rating: 'negative',
      reasonCategory: 'wrong_products',
      userComment: `Watchdog Sentinel: ${failedSrc} yuklenemedi. Otomatik onarim: ${repairedImage || 'tamamlandi'}`,
      timestamp: new Date().toISOString(),
    });

    // 3. Telegram Bekci Bildirimi (Kritikse gonder)
    if (productName) {
      sendTelegramNotification(
        `🖼️ *RoboPengu Görsel Bekçisi Devreye Girdi!*\n\n*Ürün:* ${productName}\n*Hata:* Kırık/Ulaşılamayan görsel (${failedSrc.slice(0, 50)}...)\n*İşlem:* Otomatik görsel kurtarma motoru çalıştırıldı ve yenilendi! 🛡️`
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      repairedImage: repairedImage || '/images/product-placeholder.png',
      isFallback,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
