import assert from 'node:assert/strict';
import { tryExtractComparisonFromMessage, resolveCompareProducts } from '../src/lib/ai/resolvers';
for (const prompt of ['iphone 17 vs samsung s26 kıyasla','iphone17 vs s26','IPHONE 17 VS SAMSUNG S26 KIYASLA','iphone 17 ile samsung s 26 karşılaştır','dostum iphone 17 ve galaxy s26 kıyasla']) {
  const names = tryExtractComparisonFromMessage(prompt);
  assert.equal(names?.length, 2, prompt);
  const result = resolveCompareProducts(names!);
  assert.ok(result.ok, `${prompt}: ${result.message}`);
  assert.match(result.data!.products[0].name, /iPhone 17 \(/);
  assert.match(result.data!.products[1].name, /Galaxy S26(?: \(|$)/);
  assert.doesNotMatch(result.data!.products.map(p => p.name).join(' '), /Ultra|Pro|Max|Plus/);
}
const tier = resolveCompareProducts(tryExtractComparisonFromMessage('iphone17 pro max vs s26 ultra kıyasla')!);
assert.ok(tier.ok, tier.message);
assert.match(tier.data!.products[0].name, /Pro Max/);
assert.match(tier.data!.products[1].name, /Ultra/);
assert.equal(resolveCompareProducts(tryExtractComparisonFromMessage('iphone 99 vs samsung s26 kıyasla')!).ok, false);
assert.equal(resolveCompareProducts(tryExtractComparisonFromMessage('iphone 17 vs samsung s999 kıyasla')!).ok, false);
assert.equal(resolveCompareProducts(tryExtractComparisonFromMessage('iphone 17 8tb vs samsung s26 kıyasla')!).ok, false);
console.log('PASS: natural comparison aliases, spacing/case, whole-name parsing, exact base/Pro Max/Ultra tiers, unknown model/capacity fail closed');
