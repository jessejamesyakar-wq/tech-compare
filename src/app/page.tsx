import React from 'react';
import {
  getAllProducts,
  getAllSmartphones,
  getAllTVs,
  getPopularComparisonsData,
  getDynamicCategoryDistributionProducts
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

  return (
    <HomePageClient
      heroSlides={dynamicHeroSlides}
      allTVsList={allTVs.slice(0, 24)}
      mixedDiscountGrid={mixedDiscountGrid.slice(0, 16)}
      bestSellerCarouselList={bestSellerCarouselList.slice(0, 20)}
      popularComparisons={enrichedPopularComparisons}
      showcaseData={showcaseData}
      counts={counts}
    />
  );
}
