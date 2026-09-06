import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { CompareProvider } from '@/context/CompareContext';
import { LogoProvider } from '@/context/LogoContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompareBar } from '@/components/layout/CompareBar';
import { LogoModal } from '@/components/layout/LogoModal';
import { ACTIVE_STORE_COUNT, ACTIVE_RETAILERS } from '@/lib/activeStores';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aceleetme.tech'),
  alternates: {
    canonical: 'https://www.aceleetme.tech',
  },
  verification: {
    google: 'Dy00YlAE7Le0s97gjpLXinIwfoupK2XNeVjJ10MtJsU',
  },
  title: 'aceleEtme | Akıllı Telefon, TV & Teknoloji Karşılaştırma ve Fiyat Takip Platformu',
  description: `Türkiye’nin %100 bağımsız ve algoritmik akıllı telefon, bilgisayar ve teknoloji karşılaştırma platformu. ${
    ACTIVE_STORE_COUNT === 1 ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} canlı fiyat takibi` : `${ACTIVE_STORE_COUNT} mağaza canlı fiyat kıyaslaması`
  } ve fiyat geçmişi grafikleri.`,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/emblem.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
      { url: '/apple-touch-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`light ${plusJakartaSans.variable} ${plusJakartaSans.className}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://www.aceleetme.tech" />
      </head>
      <body className="font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100/70 to-slate-200/50 text-slate-900 min-h-screen flex flex-col justify-between selection:bg-emerald-600 selection:text-white antialiased">
        <I18nProvider>
          <CompareProvider>
            <LogoProvider>
              <div className="flex flex-col min-h-screen relative overflow-x-clip">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
                  {children}
                </main>
                <CompareBar />
                <Footer />
                <LogoModal />
              </div>
            </LogoProvider>
          </CompareProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
