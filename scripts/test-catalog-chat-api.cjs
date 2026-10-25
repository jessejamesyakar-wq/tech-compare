const assert = require('node:assert/strict');
const origin = process.env.CHAT_TEST_URL || 'http://127.0.0.1:3110';
async function ask(prompt, history=[]) {
  const response = await fetch(`${origin}/api/chat`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,history,language:'tr'})});
  assert.equal(response.status,200);
  const body = await response.text();
  assert.match(body,/event: done/);
  const products = body.match(/event: products\ndata: ([^\n]+)/);
  const text = [...body.matchAll(/event: text\ndata: ([^\n]+)/g)].map(m=>JSON.parse(m[1])).join('');
  return {body,text,products:products ? JSON.parse(products[1]) : []};
}
(async()=>{
  const result = await ask('iPhone 18 Pro var mı?', [{role:'user',content:'iPhone 18 Pro arıyorum'},{role:'assistant',content:'iPhone 18 Pro henüz çıkmadı ve katalogda yok.'}]);
  assert.match(result.body,/"mode":"catalog"/);
  assert.match(result.text,/aceleEtme kataloğunda kayıtlı/);
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every(p=>/^Apple iPhone 18 Pro \(/.test(p.productName)));
  assert.doesNotMatch(result.text,/Pro Max|Dell|henüz çıkmadı/);
  const capacity = await ask('iPhone 18 Pro 512 GB var mı?');
  assert.ok(capacity.products.length > 0);
  assert.ok(capacity.products.every(p=>p.productName.includes('Pro (512 GB)')));
  const unknown = await ask('iPhone 99 Pro var mı?', [{role:'user',content:'iPhone 18 Pro arıyorum'},{role:'assistant',content:'Katalogda var.'}]);
  assert.equal(unknown.products.length,0);
  assert.match(unknown.text,/katalog kaydı bulamadım/);
  console.log('PASS: real SSE catalog presence despite stale denial, exact variant cards, no old-product substitution for unknown model');
})().catch(error=>{console.error(error);process.exitCode=1;});
