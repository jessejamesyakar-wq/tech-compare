import React from 'react';
import type { Product } from '@/lib/types';
import { FieldSourcesEvidence } from './FieldSourcesEvidence';

export function ProductSpecSources({ product }: { product: Product }) {
  return <FieldSourcesEvidence product={product} />;
}
