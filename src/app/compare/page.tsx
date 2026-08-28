'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { getProductById, getAllProducts } from '@/lib/data';
import { Product, Smartphone, TVProduct, LaptopProduct } from '@/lib/types';
import { CompareMatrix } from '@/components/compare/CompareMatrix';
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  Tv,
  Smartphone as PhoneIcon,
  Laptop as LaptopIcon,
  Search,
  Share2,
  Check,
  Monitor,
  Headphones,
  Watch,
  PlugZap,
  Gamepad2,
  Tablet
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'Tüm Modeller', icon: Sparkles },
  { id: 'smartphones', label: 'Telefonlar', icon: PhoneIcon },
  { id: 'monitors', label: 'Monitörler', icon: Monitor },
  { id: 'laptops', label: 'Laptoplar', icon: LaptopIcon },
  { id: 'tvs', label: 'Televizyonlar', icon: Tv },
  { id: 'headphones', label: 'Kulaklıklar', icon: Headphones },
  { id: 'smartwatches', label: 'Akıllı Saatler', icon: Watch },
  { id: 'tablets', label: 'Tabletler', icon: Tablet },
  { id: 'appliances', label: 'Ev & Yaşam', icon: PlugZap },
  { id: 'consoles', label: 'Konsollar', icon: Gamepad2 }
];

function CompareContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalCategory, setModalCategory] = useState('all');
  const [modalBrand, setModalBrand] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // URL Query Sync
  const p1 = searchParams.get('p1');
  const p2 = searchParams.get('p2');

  useEffect(() => {
    getAllProducts().then((res) => {
      setAllProducts(res);
    });
  }, []);

  useEffect(() => {
    async function loadFromUrl() {
      if (p1 || p2) {
        const list: Product[] = [];
        if (p1) {
          const res1 = await getProductById(p1);
          if (res1) list.push(res1);
        }
        if (p2) {
          const res2 = await getProductById(p2);
          if (res2) list.push(res2);
        }
        if (list.length > 0) {
          setSelectedProducts(list);
          return;
        }
      }
      if (compareList.length > 0) {
        setSelectedProducts(compareList);
      } else {
        const p1Item = await getProductById('iphone-16-pro-max');
        const p2Item = await getProductById('samsung-galaxy-s24-ultra');
        if (p1Item && p2Item) {
          setSelectedProducts([p1Item, p2Item]);
        }
      }
    }
    loadFromUrl();
  }, [p1, p2, compareList]);

  const handleSelectPreset = async (id1: string, id2: string) => {
    const item1 = await getProductById(id1);
    const item2 = await getProductById(id2);
    if (item1 && item2) {
      setSelectedProducts([item1, item2]);
    }
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedProducts[0]) url.searchParams.set('p1', selectedProducts[0].slug || selectedProducts[0].id);
    if (selectedProducts[1]) url.searchParams.set('p2', selectedProducts[1].slug || selectedProducts[1].id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const availableBrands = Array.from(
    new Set(
      allProducts
        .filter((p) => modalCategory === 'all' || p.category === modalCategory)
        .map((p) => p.brand)
    )
  ).sort().slice(0, 10);

  const filteredModalProducts = allProducts.filter((p) => {
    const isAlreadySelected = selectedProducts.some((sp) => sp.id === p.id);
    if (isAlreadySelected) return false;
    if (modalCategory !== 'all' && p.category !== modalCategory) return false;
    if (modalBrand !== 'all' && p.brand !== modalBrand) return false;
    if (!searchQuery) return true;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Akıllı Avantaj & Fark Analizli Karşılaştırma Masası</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.compareTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Telefon, Monitör, Laptop, TV ve Kulaklık modellerinin teknik güç, ekran, batarya ve mağaza fiyatlarını yan yana inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Share / Copy Link Button */}
          {selectedProducts.length >= 2 && (
            <button
              onClick={handleCopyLink}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Bu karşılaştırmanın bağlantısını kopyala"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-black">Bağlantı Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>Düelloyu Paylaş</span>
                </>
              )}
            </button>
          )}

          {selectedProducts.length > 0 && (
            <button
              onClick={() => {
                clearCompare();
                setSelectedProducts([]);
              }}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAll}</span>
            </button>
          )}

          {selectedProducts.length < 4 && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Model Ekle ({selectedProducts.length}/4)</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Fast Comparisons */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2.5">
        <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Popüler Karşılaştırma Kısayolları:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleSelectPreset('msi-mag-255pxf', 'dell-g2524h')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-600" />
            <span>MSI MAG 300Hz vs Dell G2524H 280Hz</span>
          </button>
          <button
            onClick={() => handleSelectPreset('iphone-16-pro-max', 'samsung-galaxy-s24-ultra')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PhoneIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>iPhone 16 Pro Max vs S24 Ultra</span>
          </button>
          <button
            onClick={() => handleSelectPreset('macbook-pro-16-m4-max-2024', 'lenovo-legion-pro-7i-gen9')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <LaptopIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>MacBook Pro M4 Max vs Legion Pro 7i</span>
          </button>
          <button
            onClick={() => handleSelectPreset('philips-65oled951-12', 'tcl-98c8k-2025')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Tv className="w-3.5 h-3.5 text-indigo-600" />
            <span>Philips 65OLED951 vs TCL 98C8K</span>
          </button>
        </div>
      </div>

      {/* Main Table Matrix */}
      {selectedProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Scale className="w-8 h-8" />
          </div>
          <h3 className="text-slate-900 text-xl font-bold">Karşılaştırma Masası Boş</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Yukarıdaki model ekle butonunu veya popüler kısayolları kullanarak modelleri yan yana inceleyebilirsiniz.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Model Seç ve Karşılaştır</span>
            </button>
          </div>
        </div>
      ) : (
        <CompareMatrix products={selectedProducts} />
      )}

      {/* Quick Add Product Modal with Category & Brand Filters */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-slate-900 font-black text-base">Karşılaştırmak İçin Model Seçin</h3>
                <p className="text-xs text-slate-500 font-medium">Kategori veya marka seçerek 600+ ürün arasından filtreleyin.</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                Kapat ✕
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = modalCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setModalCategory(tab.id);
                      setModalBrand('all');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Brand Pills */}
            {availableBrands.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                <button
                  onClick={() => setModalBrand('all')}
                  className={`px-2.5 py-1 rounded-lg font-extrabold cursor-pointer transition-colors ${
                    modalBrand === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tüm Markalar
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setModalBrand(brand)}
                    className={`px-2.5 py-1 rounded-lg font-extrabold cursor-pointer transition-colors ${
                      modalBrand === brand
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input inside modal */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Model adı veya özellik ara (Örn: 240Hz, iPhone 16, Dell, MSI, OLED)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filtered Products List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {filteredModalProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                  Arama kriterlerinize uygun model bulunamadı.
                </div>
              ) : (
                filteredModalProducts.slice(0, 30).map((product) => {
                  const specs = (product.specs || {}) as Record<string, any>;
                  let specSubtitle = `${product.brand} • ${product.category}`;

                  if (product.category === 'monitors') {
                    specSubtitle = `${product.brand} • ${specs.screenSizeInches || ''}" • ${specs.refreshRateHz || 60}Hz • ${specs.panelType || 'IPS'}`;
                  } else if (product.category === 'tvs') {
                    specSubtitle = `${product.brand} • ${specs.screenSizeInches || ''}" Ekran • ${specs.displayTech || '4K'}`;
                  } else if (product.category === 'laptops') {
                    specSubtitle = `${product.brand} • ${specs.processor || 'Laptop'} • ${specs.ramGb ? `${specs.ramGb}GB RAM` : ''}`;
                  } else if (product.category === 'smartphones') {
                    specSubtitle = `${product.brand} • ${specs.screen?.size || ''} • ${specs.memory?.ramGb || 8}GB RAM`;
                  }

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        addToCompare(product);
                        setSelectedProducts((prev) => [...prev.filter((p) => p.id !== product.id), product]);
                        setAddModalOpen(false);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-200/80">
                          <img src={product.image} alt={product.name} className="h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="text-slate-900 text-xs font-black group-hover:text-emerald-600 transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {specSubtitle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 tabular-nums block">
                          {product.basePrice.toLocaleString()} TL
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          + Karşılaştır
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <CompareContent />
    </Suspense>
  );
}
