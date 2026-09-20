import { Metadata } from 'next';
import CompareClient from './CompareClient';
import { DEFAULT_DUEL_P1, DEFAULT_DUEL_P2 } from '@/lib/defaultDuelProducts';

export const metadata: Metadata = {
  title: 'Ürün Karşılaştırma - aceleEtme',
  description: 'Akıllı telefon, bilgisayar ve teknoloji ürün karşılaştırma ve düello aracı.',
  alternates: {
    canonical: 'https://www.aceleetme.tech/compare',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ComparePage() {
  return <CompareClient defaultProducts={[DEFAULT_DUEL_P1, DEFAULT_DUEL_P2]} />;
}
