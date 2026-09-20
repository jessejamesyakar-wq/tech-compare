import { Metadata } from 'next';
import CompareClient from '../compare/CompareClient';
import { DEFAULT_DUEL_P1, DEFAULT_DUEL_P2 } from '@/lib/defaultDuelProducts';

export const metadata: Metadata = {
  title: 'Düello Arenası - aceleEtme',
  description: 'Canlı teknoloji ürün karşılaştırması ve düello arenası.',
  alternates: {
    canonical: 'https://www.aceleetme.tech/duello',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DuelloPage() {
  return <CompareClient defaultProducts={[DEFAULT_DUEL_P1, DEFAULT_DUEL_P2]} />;
}
