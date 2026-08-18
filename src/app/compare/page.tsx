'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { getProductById, getAllProducts } from '@/lib/data';
import { Product, Smartphone, TVProduct, LaptopProduct } from '@/lib/types';
import { CompareMatrix } from '@/components/compare/CompareMatrix';
import { Scale, Plus, Trash2, ArrowLeft, Sparkles, Tv, Smartphone as PhoneIcon, Laptop as LaptopIcon, Search } from 'lucide-react';

function CompareContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      // If compareList has items, load them; if empty, load default top 2 flagship phones for instant comparison
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

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredModalProducts = allProducts.filter((p) => {
    const isAlreadySelected = selectedProducts.some((sp) => sp.id === p.id);
    if (isAlreadySelected) return false;
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Otomatik Fark Vurgulamalı Karşılaştırma Masası</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.compareTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Telefon ve Televizyon modellerinin ekran, performans, kamera, batarya ve mağaza fiyatlarını yan yana inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => {
                clearCompare();
                setSelectedProducts([]);
              }}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
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
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
        <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Popüler Karşılaştırma Kısayolları:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleSelectPreset('macbook-air-m3-13-2024', 'lenovo-thinkpad-x1-carbon-gen12')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <LaptopIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>MacBook Air M3 vs ThinkPad X1 Carbon</span>
          </button>
          <button
            onClick={() => handleSelectPreset('macbook-pro-16-m4-max-2024', 'lenovo-legion-pro-7i-gen9')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <LaptopIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>MacBook Pro M4 Max vs Legion Pro 7i</span>
          </button>
          <button
            onClick={() => handleSelectPreset('iphone-16-pro-max', 'samsung-galaxy-s24-ultra')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <PhoneIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>iPhone 16 Pro Max vs S24 Ultra</span>
          </button>
          <button
            onClick={() => handleSelectPreset('philips-65oled951-12', 'tcl-98c8k-2025')}
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
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
          <p className="text-xs text-slate-500 max-w-md mx-auto">Yukarıdaki model ekle butonunu veya popüler kısayolları kullanarak modelleri yan yana inceleyebilirsiniz.</p>
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

      {/* Quick Add Product Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 font-bold text-base">Karşılaştırmak İçin Model Seçin</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Kapat ✕
              </button>
            </div>

            {/* Search Input inside modal */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Model adı veya marka ara (Örn: iPhone 16, Philips, TCL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {filteredModalProducts.map((product) => {
                const isTv = product.category === 'tvs';
                const isLaptop = product.category === 'laptops';
                const tvSpecs = isTv ? (product as TVProduct).specs : null;
                const laptopSpecs = isLaptop ? (product as LaptopProduct).specs : null;
                const phoneSpecs = product.category === 'smartphones' ? (product as Smartphone).specs : null;

                const specSubtitle = isTv
                  ? `${product.brand} • ${tvSpecs?.screenSizeInches}" Ekran • ${tvSpecs?.displayTech}`
                  : isLaptop
                  ? `${product.brand} • ${laptopSpecs?.processor || 'Laptop'} • ${laptopSpecs?.ramGb ? `${laptopSpecs.ramGb}GB RAM` : ''}`
                  : `${product.brand} • ${phoneSpecs?.screen?.size || ''} • ${phoneSpecs?.memory?.ramGb || 8}GB RAM`;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      addToCompare(product);
                      setSelectedProducts((prev) => [...prev.filter((p) => p.id !== product.id), product]);
                      setAddModalOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img src={product.image} alt={product.name} className="h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 text-xs font-bold group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {specSubtitle}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-emerald-600">
                      {product.basePrice.toLocaleString()} TL
                    </span>
                  </div>
                );
              })}
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
