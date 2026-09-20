import { getStoredProducts, deleteProduct } from '../src/lib/adminData';

export async function performFullStateCleanup(
  injectedProductIds: Set<string>,
  preExistingCatalogSnapshot: string[],
  preExistingCatalogSnapshotCount: number,
  testKey: string,
  baseUrl = 'http://localhost:3000'
): Promise<{ serverMemoryCleanupPassed: boolean; localMemoryCleanupPassed: boolean }> {
  let serverMemoryCleanupPassed = false;
  let localMemoryCleanupPassed = false;

  console.log(`\n🧹 Ortak Test Temizliği Başlatılıyor (${injectedProductIds.size} ürün bellekten temizleniyor)...`);
  const deleteIdsList = Array.from(injectedProductIds);
  // Never delete a pre-existing record, even if a caller incorrectly tracked it.
  if (deleteIdsList.some((id) => preExistingCatalogSnapshot.includes(id))) {
    throw new Error('Test cleanup refused to delete a pre-existing catalog product');
  }

  // 1. Sunucu Taraflı Temizlik ve HTTP 404 Doğrulaması (Next.js Server Memory Cleanup)
  try {
    const target = new URL(baseUrl);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
      throw new Error('Test cleanup is restricted to a local test server');
    }
    if (deleteIdsList.length === 0) {
      serverMemoryCleanupPassed = true;
    } else {
      const deleteRes = await fetch(new URL('/api/test-inject-products', target), {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
        headers: { 'Content-Type': 'application/json', 'x-test-injection-key': testKey },
        body: JSON.stringify({ deleteIds: deleteIdsList }),
      });

      if (deleteRes.status !== 200) {
        console.error(`  ❌ Sunucu silme isteği başarısız oldu: HTTP ${deleteRes.status}`);
      } else {
        const deleteData = await deleteRes.json();
        if (!deleteData || deleteData.ok !== true || deleteData.deletedCount !== deleteIdsList.length) {
          console.error('  ❌ Sunucu silme yanıt sonucu geçersiz:', deleteData);
        } else {
          // Verify each injected product returns HTTP 404 from real server API
          let allDeletedOnServer = true;
          for (const id of deleteIdsList) {
            const checkRes = await fetch(new URL(`/api/products/${encodeURIComponent(id)}`, target), {
              redirect: 'manual', signal: AbortSignal.timeout(30000),
            });
            if (checkRes.status !== 404) {
              console.error(`  ❌ Test ürünü (${id}) sunucu API'sinde hâlâ erişilebilir! HTTP status: ${checkRes.status}`);
              allDeletedOnServer = false;
            }
          }

          if (allDeletedOnServer) {
            serverMemoryCleanupPassed = true;
            console.log('  ✅ Sunucu bellek temizliği doğrulandı: HTTP POST deleteIds -> 200 OK ve tüm enjekte ürünler /api/products/[id] üzerinde HTTP 404 verdi.');
          }
        }
      }
    }
  } catch (err) {
    console.error('  ❌ Sunucu temizliği sırasında hata oluştu:', err);
  }

  // 2. Test Süreci Yerel Bellek Temizliği (Local Process Memory Cleanup)
  // Always runs even if server memory cleanup fails or throws an exception
  try {
    for (const id of deleteIdsList) {
      await deleteProduct(id);
    }

    const remainingInjected = getStoredProducts().filter((p) => injectedProductIds.has(p.id));
    const currentIds = getStoredProducts().map((p) => p.id);
    const allPreExistingIntact = preExistingCatalogSnapshot.every((id) => currentIds.includes(id));

    if (remainingInjected.length === 0 && currentIds.length === preExistingCatalogSnapshotCount && allPreExistingIntact) {
      localMemoryCleanupPassed = true;
      console.log('  ✅ Yerel bellek temizliği doğrulandı: Test süreci kataloğundan yalnızca test kayıtları kaldırıldı, ilksel snapshot korundu.');
    } else {
      console.error('  ❌ Yerel bellek temizlik doğrulaması başarısız oldu!');
    }
  } catch (err) {
    console.error('  ❌ Yerel temizlik sırasında hata oluştu:', err);
  }

  return { serverMemoryCleanupPassed, localMemoryCleanupPassed };
}
