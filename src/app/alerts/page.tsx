import { Metadata } from 'next';
import AlertsClient from './AlertsClient';

export const metadata: Metadata = {
  title: 'Fiyat Hedeflerim - aceleEtme',
  description: 'Bu tarayıcıda saklanan kişisel fiyat hedefleri. Otomatik bildirim gönderilmez.',
  alternates: {
    canonical: 'https://www.aceleetme.tech/alerts',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AlertsPage() {
  return <AlertsClient />;
}
