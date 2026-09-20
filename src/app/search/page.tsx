import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Ürün Arama - aceleEtme',
  description: 'Akıllı telefon, bilgisayar ve teknoloji ürün arama motoru.',
  alternates: {
    canonical: 'https://www.aceleetme.tech/search',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
