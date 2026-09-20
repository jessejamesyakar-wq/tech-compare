import assert from 'node:assert/strict';
import { buildComparisonRows } from '../src/lib/ai/specFields';
import { resolveCompareProducts, formatComparisonData, detectSetupOrPackageQuery } from '../src/lib/ai/resolvers';
import { getComparisonRows } from '../src/lib/comparisonEvidence';
import { buildCatalogChatReply, describeChatPrice, INSUFFICIENT_COMPARISON } from '../src/lib/ai/chatEvidence';
import { readChatEvents } from '../src/lib/ai/chatStream';
import type { Product } from '../src/lib/types';

let checks = 0;
function check(name: string, fn: () => void) { fn(); checks++; console.log('PASS', name); }
const phone = (id: string, specs: unknown): Product => ({ id, slug: id, name: id, brand: 'Fixture', category: 'smartphones', specs } as Product);
const products = [phone('A', { processor: { antutu: 2000000 }, camera: { main: 200 }, screen: { size: '6.2"' }, memory: { storage: 512 } }), phone('B', { processor: { antutu: 1000000 }, camera: { main: 50 } })];
const rows = buildComparisonRows(products, 'smartphones');
check('chat contains the exact shared comparison fields', () => assert.deepEqual(rows.map(r => r.values), getComparisonRows(products).map(r => products.map(r.getValue))));
check('megapixels and unsourced benchmark do not select a winner', () => assert(rows.filter(r => /kamera|antutu/i.test(r.label)).every(r => r.superiorIdx === null)));
check('missing processor is not inferred', () => assert.deepEqual(rows.find(r => r.label === 'İşlemci')?.values, ['Bilinmiyor', 'Bilinmiyor']));
check('mixed categories have no matrix', () => assert.equal(buildComparisonRows([products[0], { ...products[1], category: 'tvs' } as Product], 'smartphones').length, 0));
check('setup query never fabricates a TV/console duel', () => assert.equal(detectSetupOrPackageQuery('10 adet PlayStation salonu ekipman paketi'), null));
const result = resolveCompareProducts(['iPhone 16 Pro Max 512 GB', 'Samsung Galaxy S24']);
assert(result.ok && result.data);
const panel = formatComparisonData(result.data);
check('actual resolver preserves explicit 512 GB', () => assert.match(panel.products[0].name, /512 GB/));
check('actual resolver has neither fake overall winner nor fake tie', () => { assert.equal(result.data!.winner, null); assert.equal(panel.winner, null); assert.equal(panel.overallStatus, 'insufficient_data'); });
const reply = buildCatalogChatReply(panel);
check('response and panel share missing-evidence verdict', () => { assert(reply.includes(INSUFFICIENT_COMPARISON)); assert(reply.includes('beraberlik anlamına gelmez')); });
check('reply never claims a lab or a technology winner', () => assert(!/laboratuvarında|liderliği|öne çıkıyor|kritik donanım testinde/.test(reply)));
check('reference prices are visibly labelled', () => assert.match(describeChatPrice({price: 42000, priceStatus: 'unverified'}), /42.000 TL.*Katalog Referans Fiyatı.*Fiyat doğrulanmadı/));
check('stale price keeps observed-date label', () => assert.match(describeChatPrice({price: 42000, priceStatus:'stale', statusLabel:'Son görülen fiyat: 18.09.2026'}), /18.09.2026/));
check('current offer can be labelled current', () => assert.match(describeChatPrice({price:42000,currentPrice:42000,priceStatus:'fresh'}), /Güncel Fiyat/));
check('null/invalid recommendation price does not crash or invent number', () => { assert.match(buildCatalogChatReply(null, [{productName:'X',price:null}]), /Fiyat bilgisi yok/); assert(!describeChatPrice({price:NaN}).includes('NaN')); });
check('failed resolution is a clarification, not a fake product', () => assert.match(buildCatalogChatReply(null, [], 'Bu model bulunamadı.'), /Bu model bulunamadı/));

async function collect(body: ReadableStream<Uint8Array>, options: Partial<Parameters<typeof readChatEvents>[1]> = {}) {
  const events = []; for await (const event of readChatEvents(body, { signal: new AbortController().signal, ...options })) events.push(event); return events;
}
const encode = new TextEncoder();
async function run() {
  let cancelled = false;
  const bytes = encode.encode('event:panel\r\ndata: {"type":"comparison"}\r\n\r\nevent: text\r\ndata: "Türkçe 🐧"\r\n\r\nevent:done\r\ndata:[DONE]\r\n\r\n');
  const events = await collect(new ReadableStream({start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); }, cancel() { cancelled = true; }}));
  check('fragmented CRLF and UTF-8 decode correctly', () => assert.deepEqual(events, [{event:'panel',data:'{"type":"comparison"}'},{event:'text',data:'"Türkçe 🐧"'}]));
  check('done closes reader without waiting for network EOF', () => assert(cancelled));
  const multiline = await collect(new ReadableStream({start(c) { c.enqueue(encode.encode(':heartbeat\n\nevent:text\ndata:first\ndata:second\n\n')); c.close(); }}));
  check('multiline data and comment-only frames', () => assert.deepEqual(multiline, [{event:'text',data:'first\nsecond'}]));
  let stalledCancelled = false;
  await assert.rejects(collect(new ReadableStream({start(c) { c.enqueue(encode.encode('event:panel\ndata:{}\n\n')); }, cancel() { stalledCancelled = true; }}), { idleMs: 15 }), /Yanıt akışı durdu/);
  check('stream stalled after panel fails and is cancelled', () => assert(stalledCancelled));
  const controller = new AbortController();
  const aborting = collect(new ReadableStream({start(c) { c.enqueue(encode.encode('event:text\ndata:partial\n\n')); }}), { signal: controller.signal });
  controller.abort();
  await assert.rejects(aborting, {name:'AbortError'}); checks++; console.log('PASS abort interrupts response');
  await assert.rejects(collect(new ReadableStream({}), { totalMs: 0 }), /Yanıt süresi doldu/); checks++; console.log('PASS total deadline');
  console.log(`${checks} PASS, 0 FAIL (pure data + isolated stream fixtures; no catalogue writes)`);
}
run().catch(error => { console.error(error); process.exitCode=1; });
