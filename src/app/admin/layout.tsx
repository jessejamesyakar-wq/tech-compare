import type { Metadata } from 'next';
import { AdminAccessGate } from '@/components/admin/AdminAccessGate';

export const metadata: Metadata = {
  title: 'Yönetim | aceleEtme',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAccessGate>{children}</AdminAccessGate>;
}
