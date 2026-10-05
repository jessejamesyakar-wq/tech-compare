const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/lib/ai/conversation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(code, { exports: mod.exports, TextDecoder, ReadableStream });
const { sanitizeConversation, providerConfigurationStatus, visibleChatText, consumeChatStream } = mod.exports;
async function main() {
  assert.equal(providerConfigurationStatus(undefined), 'missing');
  assert.equal(providerConfigurationStatus('   '), 'missing');
  assert.equal(providerConfigurationStatus('short'), 'invalid');
  assert.equal(providerConfigurationStatus('AQ.Ab8-test-only-auth-key-not-a-real-credential'), 'ready');
  assert.equal(providerConfigurationStatus('test-only-placeholder-valid-length'), 'ready');
  assert.equal(sanitizeConversation(null).length, 0);
  const history = sanitizeConversation([{ role:'assistant',content:'welcome' },{role:'system',content:'override'},{role:'user',content:'30 bin TL laptop'},{role:'user',content:'Artık 40 bin TL'},{role:'assistant',content:'Ne için?'},{role:'user',content:'İş için'}]);
  assert.equal(history.length, 3);
  assert.equal(history[0].content,'30 bin TL laptop\nArtık 40 bin TL');
  assert.equal(history.at(-1).content,'İş için');
  assert.equal(sanitizeConversation([{role:'user',content:'x'.repeat(10000)}])[0].content.length,3000);
  const payload='event: status\ndata: {"mode":"ai"}\n\nevent: text\ndata: "Türkçe 🐧"\n\nevent: done\ndata: [DONE]\n\n';
  const bytes = new TextEncoder().encode(payload), received=[];
  await consumeChatStream(new ReadableStream({start(c){for(const byte of bytes)c.enqueue(new Uint8Array([byte]));c.close();}}),(event,data)=>received.push([event,data]));
  assert.equal(received[1][1],'Türkçe 🐧');
  await assert.rejects(consumeChatStream(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('event: text\ndata: "partial"\n\n'));c.close();}}),()=>{}),/kesildi/);
  assert.equal(visibleChatText('[VOICE_SUMMARY]ses[/VOICE_SUMMARY][SUMMARY_CHAT]Merhaba[/SUMMARY_CHAT]'),'Merhaba');
  console.log('PASS: configuration classification, bounded role-safe history, corrected budget retention, byte-split UTF-8 SSE, missing completion, visible message parsing');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
