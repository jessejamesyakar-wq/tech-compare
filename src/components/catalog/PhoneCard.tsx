'use client';

import React from 'react';
import type { Smartphone } from '@/lib/types';
import { CompactProductCard } from './CompactProductCard';

/** Compatibility entry point; share verified pricing and unknown-spec handling. */
export function PhoneCard({ phone, index = 0 }: { phone: Smartphone; index?: number }) {
  return <CompactProductCard product={phone} index={index} />;
}
