import React from 'react';
import {
  getAllProducts,
  getAllSmartphones,
  getAllTVs,
  getPopularComparisonsData,
  getDynamicCategoryDistributionProducts,
  toCatalogProduct
} from '@/lib/data';
import { Smartphone, TVProduct } from '@/lib/types';
import { getDynamicHeroSlides } from '@/lib/heroSlides';
import { HomePageClient } from '@/components/home/HomePageClient';

export const revalidate = 3600; // Revalidate every 1 hour

export default async function HomePage() {
  const [allProducts, allPhones, allTVs, popComparisons, showcaseData] = await Promise.all([
    getAllProducts(),
    getAllSmartphones(),
    getAllTVs(),
    getPopularComparisonsData(),
    getDynamicCategoryDistributionProducts(24)
  ]);

  const counts = {
    smartphones: allPhones.length || 823,
    laptops: 831,
    tvs: allTVs.length || 938,
    appliances: 956,
    tablets: 557,
    smartwatches: 136,
    headphones: 823,
    consoles: 70,
    monitors: 634
  };

  // Hero Slides showcasing top-tier flagships across all categories
  const dynamicHeroSlides = getDynamicHeroSlides(allProducts);

  // Mixed 16-card Discount Grid
  const topPhones = [...allPhones].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const topTVs = [...allTVs].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const mixedDiscountGrid: (Smartphone | TVProduct)[] = [];
  const maxDiscountLen = Math.max(topPhones.length, topTVs.length);
  for (let i = 0; i < maxDiscountLen; i++) {
    if (topPhones[i]) mixedDiscountGrid.push(topPhones[i]);
    if (topTVs[i]) mixedDiscountGrid.push(topTVs[i]);
  }

  // 20-card Best Seller Carousel
  const popPhones = [...allPhones]
    .filter((p) => p.isPopular || (p.rating || 0) >= 4.5)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 12);
  const popTVsList = [...allTVs]
    .filter((t) => t.isPopular || (t.rating || 0) >= 4.5)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 12);
  const bestSellerCarouselList: (Smartphone | TVProduct)[] = [];
  const maxPopLen = Math.max(popPhones.length, popTVsList.length);
  for (let i = 0; i < maxPopLen; i++) {
    if (popPhones[i]) bestSellerCarouselList.push(popPhones[i]);
    if (popTVsList[i]) bestSellerCarouselList.push(popTVsList[i]);
  }

  // Popular Comparisons enriched with names
  const enrichedPopularComparisons = popComparisons.map((duel, idx) => {
    const p1 = allPhones.find((p) => p.id === duel.phone1Id || p.slug === duel.phone1Id);
    const p2 = allPhones.find((p) => p.id === duel.phone2Id || p.slug === duel.phone2Id);
    return {
      phone1Id: duel.phone1Id,
      phone2Id: duel.phone2Id,
      phone1Name: p1 ? p1.name : 'Amiral Gemisi 1',
      phone2Name: p2 ? p2.name : 'Amiral Gemisi 2',
      viewCount: duel.viewCount || 10000 + idx * 1200
    };
  });

  // Curate a high-scoring, multi-brand diverse TV pool for the Home showcase rotation
  const tvPoolMap = new Map<string, TVProduct>();
  const tvTabs = ['all', 'oled', 'miniled', 'giant'];

  for (const tab of tvTabs) {
    let list = [...allTVs];
    if (tab === 'oled') {
      list = list.filter((tv) => {
        const tech = (tv.specs?.displayTech || '').toLowerCase();
        const name = (tv.name || '').toLowerCase();
        return tech.includes('oled') || name.includes('oled');
      });
    } else if (tab === 'miniled') {
      list = list.filter((tv) => {
        const tech = (tv.specs?.displayTech || '').toLowerCase();
        const name = (tv.name || '').toLowerCase();
        return tech.includes('mini') || tech.includes('neo qled') || name.includes('mini-led') || name.includes('neo qled');
      });
    } else if (tab === 'giant') {
      list = list.filter((tv) => {
        const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"/);
        const inchVal = nameInchMatch ? parseFloat(nameInchMatch[1]) : tv.specs?.screenSizeInches || 55;
        return inchVal >= 75;
      });
    }

    const withScore = list.map((tv) => ({
      tv,
      score: (tv.rating || 4.5) * 10 + (tv.specs?.refreshRateHz || 60) * 0.1
    })).sort((a, b) => b.score - a.score);

    const byBrand: Record<string, TVProduct[]> = {};
    for (const item of withScore) {
      const b = item.tv.brand || 'Diğer';
      if (!byBrand[b]) byBrand[b] = [];
      byBrand[b].push(item.tv);
    }

    const preferredOrder = ['Samsung', 'LG', 'Philips', 'TCL', 'Hisense', 'Grundig', 'Xiaomi', 'Vestel', 'Onvo', 'iFFALCON'];
    const brands = Object.keys(byBrand);
    brands.sort((a, b) => {
      const ia = preferredOrder.indexOf(a) !== -1 ? preferredOrder.indexOf(a) : 99;
      const ib = preferredOrder.indexOf(b) !== -1 ? preferredOrder.indexOf(b) : 99;
      return ia - ib;
    });

    let count = 0;
    let round = 0;
    let added = true;
    while (added && count < 32) {
      added = false;
      for (const b of brands) {
        if (byBrand[b][round] && count < 32) {
          tvPoolMap.set(byBrand[b][round].id, byBrand[b][round]);
          count++;
          added = true;
        }
      }
      round++;
    }
  }

  const diverseTopTVs = Array.from(tvPoolMap.values()).map(toCatalogProduct);

  return (
    <HomePageClient
      heroSlides={dynamicHeroSlides}
      allTVsList={diverseTopTVs}
      mixedDiscountGrid={mixedDiscountGrid.slice(0, 16).map(toCatalogProduct)}
      bestSellerCarouselList={bestSellerCarouselList.slice(0, 20).map(toCatalogProduct)}
      popularComparisons={enrichedPopularComparisons}
      showcaseData={showcaseData}
      counts={counts}
    />
  );
}
