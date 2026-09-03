import type { Metadata, Viewport } from 'next';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { CompareProvider } from '@/context/CompareContext';
import { LogoProvider } from '@/context/LogoContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompareBar } from '@/components/layout/CompareBar';
import { LogoModal } from '@/components/layout/LogoModal';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.aceleetme.tech'),
  alternates: {
    canonical: 'https://www.aceleetme.tech',
  },
  title: 'aceleEtme | Akıllı Telefon, TV & Teknoloji Karşılaştırma ve Fiyat Takip Platformu',
  description: 'Türkiye’nin %100 bağımsız ve algoritmik akıllı telefon, bilgisayar ve teknoloji karşılaştırma platformu. 8 mağaza canlı fiyat kıyaslaması ve fiyat geçmişi grafikleri.',
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
    <html lang="tr" className="light">
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
