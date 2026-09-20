import { NextRequest, NextResponse } from 'next/server';
import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { autoFetchAndSaveProductImage } from '@/lib/productImagePipeline';
import { saveAnomaly } from '@/lib/ai/learningHub';
import { getProductById } from '@/lib/data';

export async function POST(req: NextRequest) {
  const denied = requireMaintenanceAccess(req, 'cron');
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const { productId, failedSrc } = body;

    if (typeof productId !== 'string' || productId.length > 300 ||
        typeof failedSrc !== 'string' || failedSrc.length > 2048) {
      return NextResponse.json({ success: false, error: 'Geçersiz ürün veya görsel' }, { status: 400 });
    }
    const product = getProductById(productId);
    if (!product || product.image !== failedSrc) {
      return NextResponse.json({ success: false, error: 'Katalog görseli eşleşmedi' }, { status: 400 });
    }
    const { name: productName, category, brand } = product;

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

    return NextResponse.json({
      success: true,
      repairedImage: repairedImage || '/images/product-placeholder.png',
      isFallback,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
