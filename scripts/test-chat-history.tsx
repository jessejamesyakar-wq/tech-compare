import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { decodeChatHistory, encodeChatHistory, MAX_CHAT_HISTORY_BYTES } from '../src/lib/ai/chatHistory';
import { LazyAIAssistantModal } from '../src/components/ai/LazyAIAssistantModal';

let passed = 0;
const check = (name: string, run: () => void) => { run(); passed++; console.log(`PASS: ${name}`); };
const message = { id: 'one', role: 'assistant' as const, content: 'Türkçe karşılaştırma 🐧\nİkinci satır.' };
const decode = (value: unknown) => decodeChatHistory(JSON.stringify(value));
check('Malformed JSON is recoverable without throwing', () => { assert.deepEqual(decodeChatHistory('{'), {messages: [], invalidCount: 1}); });
check('Non-array history does not reach message rendering', () => { for (const value of [null, {}, 42, 'bad']) assert.equal(decode(value).messages.length, 0); });
check('Empty storage preserves a clean new conversation', () => { assert.deepEqual(decodeChatHistory(null), {messages: [], invalidCount: 0}); });
check('Valid Unicode message is retained exactly', () => { assert.equal(decode([message]).messages[0].content, message.content); });
check('Invalid message content and roles cannot crash rendering or enter history', () => {
 const result = decode([message, null, {id:'two',role:'system',content:'bad'}, {id:'three',role:'user',content:{}}, {id:'four',role:{toString:1},content:'bad'}]);
 assert.equal(result.invalidCount, 4); assert.deepEqual(result.messages.map(m=>m.id), ['one']);
});
check('Duplicate React message keys keep only the most recent entry', () => { assert.equal(decode([message,{...message,content:'Last'}]).messages[0].content,'Last'); });
check('Only the last 25 messages are restored in order', () => { const result=decode(Array.from({length:40},(_,i)=>({...message,id:String(i)}))); assert.equal(result.messages.length,25);assert.equal(result.messages[0].id,'15');assert.equal(result.messages[24].id,'39'); });
check('Oversized bytes and oversized individual messages are rejected', () => {
 assert.equal(decodeChatHistory(' '.repeat(MAX_CHAT_HISTORY_BYTES+1)).invalidCount,1);
 assert.equal(decode([{...message,content:'x'.repeat(24001)}]).invalidCount,1);
 assert.equal(decodeChatHistory(JSON.stringify([{...message,content:'🐧'.repeat(260000)}])).messages.length,0);
});
check('Interrupted stored stream never resumes a loading spinner', () => { assert.equal(decode([{...message,isStreaming:true}]).messages[0].isStreaming,false); });
const recommendation = {productId:'phone-a',slug:'phone-a',productName:'Phone A 512 GB',category:'smartphones',price:42000,currentPrice:42000,priceStatus:'fresh',statusLabel:'Güncel Fiyat',lastCheckedAt:'2099-01-01',reason:'Saved',image:'https://tracker.invalid/private.png',cheapestStore:'Old seller'};
check('Saved price cards never claim fresh offers or trusted seller data', () => {
 const rec=decode([{...message,recommendations:[recommendation]}]).messages[0].recommendations![0];
 assert.equal(rec.price,42000);assert.equal(rec.currentPrice,null);assert.equal(rec.priceStatus,'unverified');assert.match(rec.statusLabel!,/Önceki sohbet/);
 assert.equal(rec.lastCheckedAt,undefined);assert.equal(rec.image,undefined);assert.equal(rec.cheapestStore,undefined);
});
check('Unsafe identifiers and malformed recommendation fields are discarded', () => {
 const result=decode([{...message,recommendations:[{...recommendation,slug:'//evil.invalid'},{...recommendation,productName:{}},{...recommendation,category:{toString:1}}]}]);
 assert.equal(result.messages[0].recommendations,undefined);assert.equal(result.invalidCount,3);
});
check('Non-numeric saved price cannot trigger toLocaleString on an object', () => { assert.equal(decode([{...message,recommendations:[{...recommendation,price:{bad:1}}]}]).messages[0].recommendations![0].price,0); });
check('Unknown message properties are not copied into React state', () => { assert.deepEqual(Object.keys(decode([{...message,arbitrary:{large:true}}]).messages[0]).sort(),['content','id','isStreaming','role']); });
check('Complete messages round-trip and unfinished/oversized messages do not overwrite history', () => {
 const raw=encodeChatHistory([message]); assert.ok(raw);assert.equal(decodeChatHistory(raw).messages[0].content,message.content);
 assert.equal(encodeChatHistory([{...message,isStreaming:true}]),null);assert.equal(encodeChatHistory([{...message,content:'x'.repeat(24001)}]),null);
});
check('Closed lazy assistant renders nothing; initial loading exposes a cancellable dialog', () => {
 assert.equal(renderToStaticMarkup(<LazyAIAssistantModal isOpen={false} onClose={()=>{}}/>),'');
 const open=renderToStaticMarkup(<LazyAIAssistantModal isOpen onClose={()=>{}}/>);
 assert.match(open,/role="dialog"/);assert.match(open,/RoboPengu hazırlanıyor/);assert.match(open,/>Kapat<\/button>/);
});
console.log(`\nChat history: ${passed} PASS, 0 FAIL (isolated data + React SSR; no browser storage mutation).`);
