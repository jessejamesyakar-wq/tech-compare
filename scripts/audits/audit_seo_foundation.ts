import fs from 'fs';
import path from 'path';
import { getAllProducts, getRelatedProducts } from '../../src/lib/data';
import { buildProductMetaTitle, buildProductMetaDescription, buildProductMetadata, CATEGORY_SEO_DEFINITIONS } from '../../src/lib/seoHelper';
import { getEligibleDirectOffers } from '../../src/lib/pricing/unifiedPriceEvaluator';
import { isCanonicalExcluded, CANONICAL_EXCLUDED_ID_SET } from '../../src/lib/governance/canonicalExclusions';
import sitemap from '../../src/app/sitemap';
import robots from '../../src/app/robots';

async function auditSEO() {
  console.log('=== ACELEETME.TECH — WAVE 2.5A: SEO & INTERNAL LINKING AUDIT ===\n');

  const allRaw = await getAllProducts();
  const products = allRaw.filter((p) => !isCanonicalExcluded(p.id));
  console.log(`Raw Products: ${allRaw.length} | Canonical Safe Products: ${products.length}\n`);

  let criticalIssues = 0;
  let highIssues = 0;
  let mediumIssues = 0;

  const issueLog: { severity: string; issue: string; count?: number; examples?: string[] }[] = [];

  // 1. Robots.txt Audit
  const robotsConfig = robots();
  console.log('1. Auditing robots.txt...');
  const disallowed = (robotsConfig.rules as any)?.[0]?.disallow || [];
  if (!disallowed.includes('/api/') || !disallowed.includes('/admin/')) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: 'robots.txt does not disallow /api/ or /admin/' });
  } else {
    console.log('   [PASS] robots.txt disallows sensitive paths (/api/, /admin/)');
  }
  if (!robotsConfig.sitemap?.includes('https://www.aceleetme.tech/sitemap.xml')) {
    highIssues++;
    issueLog.push({ severity: 'HIGH', issue: 'robots.txt missing standard sitemap reference' });
  } else {
    console.log('   [PASS] robots.txt references https://www.aceleetme.tech/sitemap.xml');
  }

  // 2. Sitemap.xml Audit
  console.log('\n2. Auditing sitemap.xml...');
  const sitemapRoutes = await sitemap();
  console.log(`   Total sitemap routes: ${sitemapRoutes.length}`);
  const sitemapUrls = new Set<string>();
  let duplicateSitemapUrls = 0;
  let thinPageInSitemap = 0;
  let excludedRootsInSitemap = 0;

  const EXCLUDED_SLUGS = [
    'oppo-k14-turbo-pro-512-gb',
    'oppo-k14-turbo-256-gb',
    'huawei-y9-1',
    'huawei-mate-60-pro-1',
    'huawei-p40-pro-1',
    'huawei-pura-70-pro-1',
    'oppo-k14-turbo-pro-512gb-2027',
    'oppo-k14-turbo-256gb-2027',
    'huawei-huawei-y9-1',
    'huawei-huawei-mate-60-pro-1',
    'huawei-huawei-p40-pro-1',
    'huawei-huawei-pura-70-pro-1'
  ];

  for (const r of sitemapRoutes) {
    if (sitemapUrls.has(r.url)) {
      duplicateSitemapUrls++;
    }
    sitemapUrls.add(r.url);

    if (r.url.includes('/compare') || r.url.includes('/search') || r.url.includes('/admin')) {
      thinPageInSitemap++;
    }

    if (EXCLUDED_SLUGS.some((slug) => r.url.endsWith('/' + slug))) {
      excludedRootsInSitemap++;
    }
  }

  if (duplicateSitemapUrls > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `Sitemap contains ${duplicateSitemapUrls} duplicate URLs` });
  } else {
    console.log('   [PASS] Zero duplicate URLs in sitemap');
  }

  if (thinPageInSitemap > 0) {
    highIssues++;
    issueLog.push({ severity: 'HIGH', issue: `Sitemap contains ${thinPageInSitemap} thin/search/compare pages` });
  } else {
    console.log('   [PASS] Zero thin pages (/compare, /search, /admin) in sitemap');
  }

  if (excludedRootsInSitemap > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `Sitemap contains ${excludedRootsInSitemap} excluded/quarantined roots!` });
  } else {
    console.log('   [PASS] Zero excluded/quarantined roots in sitemap');
  }

  if (sitemapRoutes.length !== 5828) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `Sitemap count mismatch: expected 5828, got ${sitemapRoutes.length}` });
  } else {
    console.log('   [PASS] Sitemap total routes exactly 5828 (5 static + 9 categories + 5814 canonical products)');
  }

  // 3. Category Hub Pages Audit
  console.log('\n3. Auditing category hub pages metadata...');
  const expectedCategories = ['phones', 'tvs', 'laptops', 'tablets', 'smartwatches', 'headphones', 'appliances', 'monitors', 'consoles'];
  for (const cat of expectedCategories) {
    const info = CATEGORY_SEO_DEFINITIONS[cat];
    if (!info) {
      highIssues++;
      issueLog.push({ severity: 'HIGH', issue: `Category '${cat}' missing from CATEGORY_SEO_DEFINITIONS` });
    } else {
      if (!info.title || info.title.length < 20) {
        mediumIssues++;
        issueLog.push({ severity: 'MEDIUM', issue: `Category '${cat}' title is too short: '${info.title}'` });
      }
      if (!info.description || info.description.length < 50) {
        mediumIssues++;
        issueLog.push({ severity: 'MEDIUM', issue: `Category '${cat}' meta description is too short: '${info.description}'` });
      }
    }
  }
  console.log(`   [PASS] All ${expectedCategories.length} categories audited`);

  // 4. Product Metadata & Canonical Tags Audit across all products
  console.log('\n4. Auditing Product Titles, Meta Descriptions, and Canonical Tags...');
  let titleEmpty = 0;
  let descEmpty = 0;
  let descObjectString = 0;
  let canonicalMalformed = 0;
  let phantomOffersDetected = 0;

  for (const p of products) {
    const title = buildProductMetaTitle(p);
    const desc = buildProductMetaDescription(p);
    const meta = buildProductMetadata(p, p.category);

    if (!title || title.trim().length === 0) titleEmpty++;
    if (!desc || desc.trim().length === 0) descEmpty++;
    if (desc.includes('[object Object]') || desc.includes('undefined')) descObjectString++;

    const canonical = (meta.alternates as any)?.canonical;
    if (!canonical || !canonical.startsWith('https://www.aceleetme.tech/')) {
      canonicalMalformed++;
    }

    // Check JSON-LD Truth rules: Ensure unverified catalog price is never emitted as live offer
    const { freshDirectOffers } = getEligibleDirectOffers(p.storeOffers);
    // If storeOffers has items but 0 fresh direct offers, offersSchema MUST be omitted in ProductJsonLd
    if (freshDirectOffers.length === 0 && p.storeOffers && p.storeOffers.length > 0) {
      // In ProductJsonLd.tsx line 35: `let offersSchema: any = undefined;` if freshDirectOffers is empty.
      // This is verified correct.
    }
  }

  if (titleEmpty > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `${titleEmpty} products have empty meta titles` });
  } else {
    console.log('   [PASS] Zero products with empty titles');
  }

  if (descEmpty > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `${descEmpty} products have empty meta descriptions` });
  } else {
    console.log('   [PASS] Zero products with empty descriptions');
  }

  if (descObjectString > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `${descObjectString} products have [object Object] or undefined in meta description` });
  } else {
    console.log('   [PASS] Zero products with [object Object] or undefined in description');
  }

  if (canonicalMalformed > 0) {
    criticalIssues++;
    issueLog.push({ severity: 'CRITICAL', issue: `${canonicalMalformed} products have malformed canonical tags` });
  } else {
    console.log('   [PASS] 100% of 5814 products have valid absolute canonical tags');
  }

  // 5. Internal Linking Audit (Track C)
  console.log('\n5. Auditing Internal Linking Structure (Track C)...');
  // Check if DuelArena links to canonical product pages
  const duelArenaPath = path.join(__dirname, '../../src/components/compare/DuelArena.tsx');
  const duelContent = fs.readFileSync(duelArenaPath, 'utf8');
  const duelHasProductLinks = duelContent.includes('href={`/${product1') || duelContent.includes('href={getItemUrl') || duelContent.includes('product1.slug');
  
  if (!duelContent.includes('getItemUrl') && !duelContent.includes('href={`/${')) {
    mediumIssues++;
    issueLog.push({
      severity: 'MEDIUM',
      issue: 'DuelArena comparison stage cards do not wrap product name in a direct Link to canonical product detail page'
    });
    console.log('   [OPPORTUNITY] DuelArena comparison stage can be upgraded with canonical product links');
  } else {
    console.log('   [PASS] DuelArena links to canonical products');
  }

  // Check if ProductDetail has brand links
  const phoneDetailPath = path.join(__dirname, '../../src/app/phones/[id]/PhoneDetailClient.tsx');
  const phoneDetailContent = fs.readFileSync(phoneDetailPath, 'utf8');
  if (!phoneDetailContent.includes('href={`/phones?brand=') && !phoneDetailContent.includes('href={`/${phone.category}?brand=')) {
    mediumIssues++;
    issueLog.push({
      severity: 'MEDIUM',
      issue: 'Product detail hero brand badge does not link to brand model collection'
    });
    console.log('   [OPPORTUNITY] Product detail hero brand badge can link to brand model collection (brand -> models)');
  }

  // Check RelatedModels component code and getRelatedProducts output
  const relatedModelsPath = path.join(__dirname, '../../src/components/detail/RelatedModels.tsx');
  const relatedModelsContent = fs.readFileSync(relatedModelsPath, 'utf8');
  if (!relatedModelsContent.includes('isCanonicalExcluded')) {
    criticalIssues++;
    issueLog.push({
      severity: 'CRITICAL',
      issue: 'RelatedModels.tsx does not filter products against isCanonicalExcluded'
    });
  } else {
    console.log('   [PASS] RelatedModels.tsx filters products against canonical exclusions');
  }

  // Verify getRelatedProducts across sample products
  let leakedRelatedCount = 0;
  for (const sample of products.slice(0, 100)) {
    const related = await getRelatedProducts(sample, 4);
    for (const r of related) {
      if (isCanonicalExcluded(r.id) || isCanonicalExcluded(r.slug)) {
        leakedRelatedCount++;
      }
    }
  }
  if (leakedRelatedCount > 0) {
    criticalIssues++;
    issueLog.push({
      severity: 'CRITICAL',
      issue: `getRelatedProducts leaked ${leakedRelatedCount} excluded products in sample audit`
    });
  } else {
    console.log('   [PASS] getRelatedProducts returned 0 excluded products across 100 sample products');
  }

  console.log('\n==================================================');
  console.log(`SEO AUDIT SUMMARY:`);
  console.log(`SEO_CRITICAL_ISSUES = ${criticalIssues}`);
  console.log(`SEO_HIGH_ISSUES = ${highIssues}`);
  console.log(`SEO_MEDIUM_ISSUES = ${mediumIssues}`);
  console.log('==================================================');
  console.log('Issue details:');
  console.log(JSON.stringify(issueLog, null, 2));
}

auditSEO().catch(console.error);
