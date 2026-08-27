import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { runPriceScrape, CatalogProduct } from "@/lib/scraper/run";
import { getStoredProducts } from "@/lib/adminData";
import { Product } from "@/lib/types";

export async function GET(request: NextRequest) {
  // CRON_SECRET koruması
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz istek" }, { status: 401 });
  }

  try {
    // Ürün kataloğunu dinamik olarak sistemdeki tüm ürünlerden türet
    const allProducts: Product[] = getStoredProducts();
    const dynamicCatalog: CatalogProduct[] = allProducts.slice(0, 50).map((product: Product) => ({
      id: product.id,
      searchQuery: `${product.brand} ${product.name}`,
      category: product.category,
      currentPrice: product.basePrice,
    }));

    const run = await runPriceScrape(dynamicCatalog);

    // KV veritabanı bağlıysa her ürün+site kombinasyonunu ayrı key olarak KV'ye yaz
    if (process.env.KV_REST_API_URL || process.env.KV_URL) {
      for (const item of run.results) {
        await kv.set(`price:${item.productId}:${item.source}`, item);
      }
      await kv.set("price:lastRun", {
        finishedAt: run.finishedAt,
        totalAttempts: run.totalAttempts,
        failedCount: run.failedCount,
      });
    }

    return NextResponse.json({
      ok: true,
      updated: run.results.length,
      failed: run.failedCount,
      finishedAt: run.finishedAt,
      productsTracked: dynamicCatalog.length,
      resultsPreview: run.results.slice(0, 6),
    });
  } catch (error) {
    console.error("Price update cron error:", error);
    return NextResponse.json(
      { error: "Fiyat güncelleme sırasında bir hata oluştu", details: String(error) },
      { status: 500 }
    );
  }
}
