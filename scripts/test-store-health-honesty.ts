import assert from 'node:assert/strict';
import { BaseStoreAdapter } from '../src/integrations/stores/base';
import { storeRegistry } from '../src/integrations/stores/registry';
import { priceQueue } from '../src/lib/queue/priceQueue';
import { GET } from '../src/app/api/health/route';

class TestAdapter extends BaseStoreAdapter {
  constructor(private configured: boolean, private enabled: boolean) { super({id:'test',name:'Test Store',domain:'example.com'}); }
  isConfigured(){ return this.configured; }
  isEnabled(){ return this.enabled; }
  async searchProduct(){ return []; }
  async getPrice(){ return null; }
  async getStock(){ return null; }
}

async function main() {
  let passed=0, networkCalls=0;
  const check=(name:string,fn:()=>void)=>{fn();passed++;console.log(`PASS ${name}`);};
  const originalFetch=globalThis.fetch, originalStats=priceQueue.getStats, originalStores=storeRegistry.getStoreHealthStatuses;
  const originalRedis=process.env.REDIS_URL, originalKv=process.env.KV_REST_API_URL;
  globalThis.fetch=async()=>{networkCalls++;throw new Error('Network forbidden in this test');};
  try {
    const configured=await new TestAdapter(true,true).healthCheck();
    const missing=await new TestAdapter(false,true).healthCheck();
    const disabled=await new TestAdapter(true,false).healthCheck();
    check('configuration alone is unverified',()=>assert.equal(configured.status,'CONFIGURED_UNVERIFIED'));
    check('check type explicitly configuration',()=>assert.equal(configured.checkType,'configuration'));
    check('no fabricated remote response time',()=>assert.equal(configured.responseTimeMs,undefined));
    check('missing configuration preserved',()=>assert.equal(missing.status,'NOT_CONFIGURED'));
    check('disabled store preserved',()=>assert.equal(disabled.status,'DISABLED'));
    for (const adapter of storeRegistry.getAllAdapters()) {
      const originalConfigured = adapter.isConfigured;
      try {
        adapter.isConfigured = () => true;
        const configuredStock = await adapter.getStock({ storeId: adapter.id, storeProductId: 'test-sku', title: 'Test only', url: `https://${adapter.domain}/test-product` });
        check(`${adapter.id}: credentials cannot fabricate stock or check date`, () => assert.equal(configuredStock, null));
        adapter.isConfigured = () => false;
        const missingStock = await adapter.getStock({ storeId: adapter.id, storeProductId: 'test-sku', title: 'Test only', url: `https://${adapter.domain}/test-product` });
        check(`${adapter.id}: unconfigured stock remains unknown`, () => assert.equal(missingStock, null));
      } finally { adapter.isConfigured = originalConfigured; }
    }
    priceQueue.getStats=async()=>({totalJobs:0,pending:0,processing:0,completed:0,failed:0,activeLocks:0});
    storeRegistry.getStoreHealthStatuses=async()=>[configured,missing,disabled];
    process.env.REDIS_URL='redis://example.invalid:6379';
    delete process.env.KV_REST_API_URL;
    const response=await GET();const result=await response.json();
    check('health route responds',()=>assert.equal(response.status,200));
    check('UP scoped to application process',()=>assert.equal(result.scope,'application_process'));
    check('database connection not claimed',()=>assert.equal(result.components.database.status,'NOT_CHECKED'));
    check('configured redis connection not claimed',()=>assert.equal(result.components.redis.status,'CONFIGURED_UNVERIFIED'));
    check('worker availability not fabricated',()=>assert.equal(result.components.workers.status,'NOT_CHECKED'));
    check('configured stores do not count as connected',()=>assert.equal(result.components.stores.connected,0));
    check('unverified configured count reported',()=>assert.equal(result.components.stores.configuredUnverified,1));
    delete process.env.REDIS_URL;
    const noRedis=await (await GET()).json();
    check('missing redis configuration reported',()=>assert.equal(noRedis.components.redis.status,'NOT_CONFIGURED'));
    check('no external network or database operations',()=>assert.equal(networkCalls,0));
    console.log(`STORE HEALTH: ${passed} PASS, 0 FAIL`);
  } finally {
    globalThis.fetch=originalFetch;priceQueue.getStats=originalStats;storeRegistry.getStoreHealthStatuses=originalStores;
    for (const [key,value] of [['REDIS_URL',originalRedis],['KV_REST_API_URL',originalKv]]) {if(value===undefined)delete process.env[key!];else process.env[key!]=value;}
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
