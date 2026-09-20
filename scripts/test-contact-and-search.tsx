import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContactForm } from '../src/app/iletisim/ContactForm';
import { createContactDraft, CONTACT_RECIPIENT, type ContactFields } from '../src/lib/contactDraft';
import { initClientSearch, searchLocalProductsAsync, searchLocalProducts } from '../src/lib/clientSearch';

let count=0;const check=(name:string,fn:()=>void)=>{fn();count++;console.log('PASS',name)};
const fields: ContactFields = {name:'Yerel Deneme',email:'audit@example.com',subject:'Fiyat / Ürün Hatası Bildirimi',message:'Yalnızca yerel önizleme. Gönderilmeyecek.\nİkinci satır & ? # + 🐧'};
const result=createContactDraft(fields); assert(result.ok);
check('draft preserves Turkish, multiline and reserved characters',()=>{const link=new URL(result.draft.mailto);assert.equal(link.protocol,'mailto:');assert.equal(link.pathname,CONTACT_RECIPIENT);assert(link.searchParams.get('body')!.includes(fields.message));assert.equal(link.searchParams.get('subject'),result.draft.subject);assert.deepEqual([...link.searchParams.keys()],['subject','body'])});
check('recipient is fixed; draft body is not an extra header',()=>{const r=createContactDraft({...fields,message:'bcc: test@example.com\n&cc=other@example.com'});assert(r.ok);assert.equal(new URL(r.draft.mailto).searchParams.get('cc'),null);assert.equal(r.draft.recipient,CONTACT_RECIPIENT)});
check('blank trimmed name/message and malformed email rejected',()=>{for(const f of [{name:'  '},{message:'\n  '},{email:'not-an-email'},{email:'test@example.com\nbcc:test@example.com'}])assert.equal(createContactDraft({...fields,...f}).ok,false)});
check('header line breaks and unknown subject rejected',()=>{assert.equal(createContactDraft({...fields,name:'A\nBcc: someone'}).ok,false);assert.equal(createContactDraft({...fields,subject:'Unknown'}).ok,false)});
check('input length bounds',()=>{for(const f of [{name:'a'.repeat(121)},{message:'a'.repeat(4001)},{email:'a'.repeat(255)+'@example.com'}])assert.equal(createContactDraft({...fields,...f}).ok,false)});
check('4000-character message is not silently truncated',()=>{const r=createContactDraft({...fields,message:'a'.repeat(4000)});assert(r.ok);assert(r.draft.body.includes('a'.repeat(4000)))});
check('form says prepare a draft and not send',()=>{const html=renderToStaticMarkup(<ContactForm/>);assert(html.includes('E-posta Taslağı Hazırla'));assert(html.includes('doğrudan mesaj göndermez'));assert(!html.includes('Mesajı Gönder'));assert(html.includes('autoComplete="email"'))});

async function main(){
  const originalFetch=globalThis.fetch;
  let calls=0,finish:(response:Response)=>void=()=>{};
  try {
    globalThis.fetch=(async()=>{calls++;return new Response('{}',{status:503})}) as typeof fetch;
    await assert.rejects(searchLocalProductsAsync('Galaxy'),/yüklenemedi/);count++;console.log('PASS index failure is not a no-results success');
    globalThis.fetch=(()=>{calls++;return new Promise<Response>(resolve=>{finish=resolve})}) as typeof fetch;
    const first=searchLocalProductsAsync('GALAXY S24');
    const second=searchLocalProductsAsync('xiaomi');
    const preload=initClientSearch();
    check('parallel first queries reuse one pending request',()=>assert.equal(calls,2));
    let early=false;void first.then(()=>{early=true});await Promise.resolve();
    check('first query does not resolve empty while index is pending',()=>assert.equal(early,false));
    finish(Response.json([null,{id:'bad',name:4},{id:'s24',slug:'samsung-galaxy-s24',name:'Samsung Galaxy S24',brand:'Samsung',category:'smartphones',image:'',basePrice:40000},{id:'xiaomi',slug:'xiaomi',name:'Xiaomi Akıllı Saat',brand:'Xiaomi',category:'smartwatches',image:'',basePrice:0}]));
    const [a,b,index]=await Promise.all([first,second,preload]);
    check('waiting first queries get their own actual results',()=>{assert.deepEqual(a.map(p=>p.id),['s24']);assert.deepEqual(b.map(p=>p.id),['xiaomi']);assert.equal(index.length,2)});
    check('invalid index rows do not crash normalization',()=>assert.equal(index.length,2));
    check('Turkish normalization and warm cache remain usable',()=>{assert.deepEqual(searchLocalProducts('akilli saat').map(p=>p.id),['xiaomi']);assert.deepEqual(searchLocalProducts('bilinmeyen'),[])});
    await searchLocalProductsAsync('s24');check('warm query requires no second download',()=>assert.equal(calls,2));
  } finally {globalThis.fetch=originalFetch}
  console.log(`${count} PASS, 0 FAIL. Local draft + isolated index fixtures; no email, catalogue or server writes.`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
