const assert = require('node:assert/strict');
const origin = process.env.CHAT_TEST_URL || 'http://127.0.0.1:3110';
async function ask(prompt, history=[]) {
  const response = await fetch(`${origin}/api/chat`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,history,language:'tr'})});
  assert.equal(response.status,200);
  const body = await response.text();
  assert.match(body,/event: done/);
  const panel = body.match(/event: panel\ndata: ([^\n]+)/);
  return {body,panel:panel ? JSON.parse(panel[1]) : null};
}
(async()=>{
  const resolved = await ask('Samsung 65S95H ile TCL 65C855 kıyasla');
  assert.equal(resolved.panel.products.length,2);
  assert.equal(resolved.panel.products[0].id,'samsung-65s95h');
  assert.equal(resolved.panel.products[1].id,'tcl-65c855');
  assert.match(resolved.body,/Fotoğraflar ve kayıtlı özellikler yan panelde/);
  assert.doesNotMatch(resolved.body,/event: text\ndata:.*NO_PRICE_DATA/);
  const vague = await ask('İki televizyonu kıyasla');
  assert.equal(vague.panel,null); assert.match(vague.body,/tam model kodunu/);
  const duplicate = await ask('LG OLED65G64LW ile Samsung 65S95H kıyasla');
  assert.equal(duplicate.panel,null); assert.match(duplicate.body,/birden fazla/);
  const continuation = await ask('65S95H ve 65C855',[{role:'user',content:'İki televizyonu kıyasla'},{role:'assistant',content:'Tam model kodlarını yazar mısın?'}]);
  assert.equal(continuation.panel.products.length,2);
  console.log('PASS: real chat SSE, exact pair with images, concise summary, missing/ambiguous model clarification, follow-up selection');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
