'use client';

import React from 'react';
import type { LaptopProduct } from '@/lib/types';
import { CompactProductCard } from './CompactProductCard';

/** Compatibility entry point; share verified pricing and unknown-spec handling. */
export function LaptopMediaMarktCard({ laptop, index = 0 }: { laptop: LaptopProduct; index?: number }) {
  return <CompactProductCard product={laptop} index={index} />;
}
