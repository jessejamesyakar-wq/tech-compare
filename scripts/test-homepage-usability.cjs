const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:mod.exports});return mod.exports;}
const {homeLanguages,homeCopy,translateHome}=load('src/lib/i18n/homeCopy.ts');
assert.equal(homeLanguages.length,6);
for(const [key,values] of Object.entries(homeCopy)){assert.equal(values.length,6,key);for(const value of values)assert(value.trim(),key);}
for(const lang of homeLanguages.slice(1))for(const key of ['Teknoloji karmaşık.','Mesajı gönder','Fiyat hedeflerim','Güncel teklif doğrulanmadı'])assert.notEqual(translateHome(lang,key),key);
assert.equal(translateHome('en','Samsung Galaxy S25'),'Samsung Galaxy S25');
const {conversationCategory}=load('src/lib/ai/categoryMatcher.ts');
for(const query of ['Televizyon arıyorum','I want a television','Ich suche einen Fernseher','Я ищу телевизор','Busco un televisor','Cerco un televisore'])assert.equal(conversationCategory(query,[]),'tvs',query);
assert.equal(conversationCategory('Bütçem 30.000 TL',[{role:'user',content:'Film için televizyon arıyorum.'},{role:'assistant',content:'Bütçen ne kadar?'}]),'tvs');
assert.equal(conversationCategory('Artık bir laptop arıyorum',[{role:'user',content:'Bir telefon arıyorum'}]),'laptops');
assert.equal(conversationCategory('20.000 TL ayırdım',[]),null);
assert.equal(conversationCategory('Ne almalıyım?',[{role:'assistant',content:'telefon al'}]),null);
console.log('PASS: '+Object.keys(homeCopy).length+' six-language UI entries; product names unchanged; multilingual TV intent; category retention/switch/unknown guards');
