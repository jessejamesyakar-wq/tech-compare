import assert from 'node:assert/strict';
import { RetailerQuantumScheduler as Scheduler, SimulatedAnnealingScheduler as Anneal,
  type RetailerRefreshCandidate, type RetailerHealthState } from '../src/lib/pricing/retailerQuantumScheduler';
import { RetailerAccessChannelControlPlane as Gate, RETAILER_CHANNEL_REGISTRY,
  type RetailerAccessChannel, type RetailerChannelHealth } from '../src/lib/pricing/retailerAccessChannel';
import { loadRetailerChannelState } from '../src/lib/pricing/retailerChannelState';
import { executeVatanPriceRefreshWorker } from '../src/lib/pricing/vatanPriceRefreshWorker';
import { scrapeTargetStore } from '../src/lib/scrapers/engine';
import { runPriceScrape } from '../src/lib/scraper/run';
const now = Date.parse('2026-10-04T00:00:00Z');
const channel: RetailerAccessChannel = { storeId:'vatan',channelId:'vatan:partner_feed',channelType:'PARTNER_FEED',enabled:true,productionReady:true,
  capabilities:['PRODUCT_IDENTITY','PRICE','STOCK'],rateCapRps:1,
  compliance:{accessType:'SIGNED_FEED_INGEST',requiresCredential:true,approvedForAutomation:true,ratePolicyKnown:true,termsReviewStatus:'REVIEWED'} };
const health: RetailerChannelHealth = {storeId:'vatan',channelId:channel.channelId,healthStatus:'HEALTHY',circuitBreakerState:'CLOSED',
  circuitBreakerTrippedAt:null,circuitBreakerReason:null,rateLimitUntil:null,recent403Count:0,recent429Count:0,recent5xxCount:0,
  lastSuccessAt:new Date(now).toISOString(),lastFailureAt:null,lastErrorCode:null};
const candidate: RetailerRefreshCandidate = {channelId:channel.channelId,storeId:'vatan',productId:'test-product',storeProductId:'test-mapping',
  mappingActive:true,identityStatus:'MATCHED',matchConfidence:100,lastCheckedAt:null,ageHours:500,currentPriceExists:false,currentPrice:null,
  currentStock:null,historyCount:0,lastHttpStatus:null,lastOfferStatus:null,productPriority:'HIGH_PRIORITY',storeHealth:1,recentFailureCount:0,recentNoOfferCount:0};
const storeHealth: RetailerHealthState = {storeId:'vatan',circuitBreakerOpen:false,circuitBreakerState:'CLOSED',rateLimitCooldownActive:false,degradedHealth:false,reliabilityScore:1};
const state = (c=channel,h=health) => ({channels:[c],health:[h],now});
const run = (c=candidate,s=state()) => Scheduler.schedule([c],storeHealth,{storeId:'vatan',maxRequestsPerRun:2},undefined,s);
let passed=0;
async function test(name:string, fn:()=>unknown) { await fn(); passed++; console.log(`PASS ${name}`); }
async function main() {
 await test('missing channel context blocks actual scheduler',()=> {
   const r=Scheduler.schedule([candidate],storeHealth,{storeId:'vatan',maxRequestsPerRun:2});
   assert.equal(r.selectedCandidates.length,0); assert.equal(r.telemetry.quboExecuted,false);
 });
 for (const [name,s,reason] of [
   ['not ready',state({...channel,productionReady:false}),'CHANNEL_NOT_PRODUCTION_READY'],
   ['disabled',state({...channel,enabled:false}),'CHANNEL_DISABLED'],
   ['circuit open',state(channel,{...health,circuitBreakerState:'OPEN'}),'CHANNEL_CIRCUIT_OPEN'],
   ['rate limited',state(channel,{...health,rateLimitUntil:new Date(now+1000).toISOString()}),'CHANNEL_RATE_LIMITED'],
   ['bad date',state(channel,{...health,rateLimitUntil:'invalid'}),'CHANNEL_STATE_INVALID'],
   ['wrong health owner',state(channel,{...health,storeId:'amazon'}),'CHANNEL_STATE_MISSING'],
   ['approval missing',state({...channel,compliance:{...channel.compliance,approvedForAutomation:false}}),'CHANNEL_NOT_APPROVED'],
 ] as const) await test(name,()=>{ const r=run(candidate,s); assert.equal(r.decisions[0].reason,reason); assert.equal(r.selectedCandidates.length,0); assert.equal(r.telemetry.quboExecuted,false); });
 await test('direct web blocked even with forged readiness',()=>assert.equal(Gate.evaluateChannelGate({...channel,channelType:'DIRECT_WEB'},health,now).reason,'CHANNEL_NOT_PRODUCTION_READY'));
 await test('unknown aggregate stays unknown',()=>assert.equal(Gate.deriveStoreHealthFromChannels([channel],[]),'UNKNOWN'));
 await test('all eight registries unready',()=> {
   assert.equal(Object.keys(RETAILER_CHANNEL_REGISTRY).length,8);
   for(const channels of Object.values(RETAILER_CHANNEL_REGISTRY)) for(const c of channels) assert.equal(c.productionReady,false);
 });
 const original=Anneal.solve;
 try {
   Anneal.solve=()=>{throw new Error('injected solver failure');};
   await test('actual fallback selects approved alternative only',()=> {
     const direct={...channel,channelId:'vatan:direct_web',channelType:'DIRECT_WEB' as const,productionReady:false};
     const r=Scheduler.schedule([{...candidate,channelId:direct.channelId},candidate],storeHealth,{storeId:'vatan',maxRequestsPerRun:2},undefined,
       {channels:[direct,channel],health:[health],now});
     assert.equal(r.telemetry.fallbackUsed,true); assert.equal(r.selectedCandidates.length,1);
     assert.equal(r.selectedCandidates[0].channelId,channel.channelId);
   });
   await test('cooldown preserved',()=> {
     const r=run({...candidate,lastOfferStatus:'HTTP_ERROR',ageHours:0.1});
     assert.equal(r.selectedCandidates.length,0); assert.equal(r.telemetry.quboExecuted,false);
   });
   await test('duplicate route cannot consume budget twice',()=> {
     const r=Scheduler.schedule([candidate,{...candidate,storeProductId:'duplicate'}],storeHealth,{storeId:'vatan',maxRequestsPerRun:2},undefined,state());
     assert.equal(r.selectedCandidates.length,1); assert.ok(r.decisions.some(d=>d.reason==='DUPLICATE_ROUTE'));
   });
 } finally {Anneal.solve=original;}
 await test('QUBO path preserves route identity',()=> {
   const r=run(); assert.equal(r.telemetry.quboExecuted,true); assert.equal(r.selectedCandidates.length,1);
   assert.equal(r.selectedCandidates[0].channelId,channel.channelId);
 });
 await test('DB error cannot use snapshot fallback',async()=> {
   const fake={from:()=>({select:()=>({eq:async()=>({data:null,error:{message:'denied'}})})})};
   await assert.rejects(loadRetailerChannelState(fake as any,'vatan'),/CHANNEL_STATE_UNAVAILABLE/);
 });
 await test('DB flag cannot activate unimplemented feed',async()=> {
   const fake={from:(table:string)=>({select:()=>({eq:async()=>({error:null,data:table==='retailer_access_channels'?
     [{store_id:'vatan',channel_id:'partner_feed',channel_type:'PARTNER_FEED',enabled:true,production_ready:true}]:[]})})})};
   const s=await loadRetailerChannelState(fake as any,'vatan'); assert.equal(s.channels[0].productionReady,false); assert.equal(s.channels[0].enabled,false);
 });
 await test('legacy direct web dispatcher never fetches',async()=> {
   const originalFetch=globalThis.fetch; let requests=0;
   globalThis.fetch=async()=>{requests++;throw new Error('unexpected network');};
   try {const r=await scrapeTargetStore('https://www.vatanbilgisayar.com/test');assert.equal(r.error,'CHANNEL_NOT_PRODUCTION_READY');assert.equal(requests,0);}
   finally {globalThis.fetch=originalFetch;}
 });
 await test('synthetic price generator disabled',async()=>assert.rejects(runPriceScrape([{id:'x',searchQuery:'x',currentPrice:100}]),/UNVERIFIED_PRICE_GENERATOR_DISABLED/));
 await test('worker controlled-fetch uses channel gate with zero side effects',async()=> {
   let requests=0,writes=0;
   const rows:Record<string,unknown>={
     store_products:[{product_id:'test-product',store_id:'vatan',store_product_id:'129743',active:true,match_status:'MATCHED',match_confidence:100}],
     retailer_observation_state:[{store_id:'vatan',store_product_id:'129743',last_observed_at:'2026-10-01T00:00:00Z',last_offer_status:'HTTP_ERROR',last_http_status:403}],
     retailer_store_health:{store_id:'vatan',circuit_breaker_state:'CLOSED'},prices:[],products:[],
     retailer_access_channels:[{store_id:'vatan',channel_id:'direct_web',channel_type:'DIRECT_WEB',enabled:true,production_ready:true}],
     retailer_channel_health:[{store_id:'vatan',channel_id:'direct_web',health_status:'HEALTHY',circuit_breaker_state:'CLOSED',rate_limit_until:null}]
   };
   const client={from:(table:string)=>{
     const chain:any={select:()=>chain,eq:()=>chain,order:()=>chain,in:()=>chain,maybeSingle:()=>chain,
       then:(resolve:any)=>Promise.resolve({data:rows[table],error:null}).then(resolve),
       insert:()=>{writes++;throw new Error('unexpected write');},update:()=>{writes++;throw new Error('unexpected write');},delete:()=>{writes++;throw new Error('unexpected write');}};
     return chain;
   }};
   const r=await executeVatanPriceRefreshWorker({mode:'CONTROLLED_FETCH',sbClient:client as any,customTimestamp:now,fetchImpl:async()=>{requests++;throw new Error('unexpected fetch');}});
   assert.equal(r.mappingCount,1);assert.equal(r.selectedCount,0);assert.equal(r.candidateDecisions[0].hardGateReason,'CHANNEL_NOT_PRODUCTION_READY');
   assert.equal(requests,0);assert.equal(writes,0);assert.equal(r.stateSource,'DURABLE_DB');
 });
 console.log(`PHASE_H_D_TESTS=${passed} PASS; REAL_QPU=NO; RETAILER_NETWORK=0; DB_WRITES=0`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
