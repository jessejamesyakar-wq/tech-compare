'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Maximize2, Zap, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';

interface ProductImageGalleryProps {
  product: Product;
  activeColorImage?: string;
}

export function ProductImageGallery({ product, activeColorImage }: ProductImageGalleryProps) {
  const defaultImage = activeColorImage || product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  const extraImages = (product.images || []).filter(Boolean);

  const rawImages = [defaultImage, ...extraImages];
  const allImages = Array.from(new Set(rawImages)).filter(Boolean);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync active index when activeColorImage prop changes
  React.useEffect(() => {
    if (activeColorImage) {
      const idx = allImages.indexOf(activeColorImage);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [activeColorImage]);

  const activeImage = imgError ? defaultImage : (allImages[activeIndex] || defaultImage);

  const handlePrev = () => {
    setImgError(false);
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImgError(false);
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Large Photo Stage with Pure White Background & Apple/Epey Showcase Proportions */}
      <div className="relative w-full h-80 sm:h-[420px] rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/90 flex items-center justify-center overflow-hidden group shadow-sm">
        
        {/* Popular Tag Badge */}
        {product.isPopular && (
          <div className="absolute top-4 left-4 z-10 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>Popüler Ürün</span>
          </div>
        )}

        {/* Multi Photo Counter Badge */}
        {allImages.length > 1 && (
          <div className="absolute top-4 right-4 z-10 bg-white/95 text-slate-800 backdrop-blur-md text-xs font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-slate-200">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeIndex + 1} / {allImages.length} Fotoğraf</span>
          </div>
        )}

        {/* Navigation Arrows for Multi-Photos */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer hover:border-slate-300"
              title="Önceki Fotoğraf"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer hover:border-slate-300"
              title="Sonraki Fotoğraf"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </>
        )}

        {/* Fullscreen Magnifier Trigger */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-4 right-4 z-10 p-2.5 rounded-2xl bg-white/90 hover:bg-emerald-600 hover:text-white text-slate-700 transition-all border border-slate-200 shadow-sm cursor-pointer"
          title="Fotoğrafı Büyüt"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Optimized Active Hero Image with Priority & Apple-style Fill */}
        <div className="relative w-full h-full flex items-center justify-center transition-all duration-300">
          <Image
            src={activeImage}
            alt={`${product.name} Görsel ${activeIndex + 1}`}
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
            width={800}
            height={800}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 800px"
            onError={() => setImgError(true)}
            className="w-full h-full max-h-[300px] sm:max-h-[380px] object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Thumbnail Bar Carousel for All Uploaded Photos */}
      {allImages.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Yüklenen Tüm Fotoğraflar ({allImages.length}):
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Tıklayarak inceleyebilirsiniz</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 no-scrollbar">
            {allImages.map((imgUrl, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setImgError(false);
                    setActiveIndex(i);
                  }}
                  className={`w-16 h-16 rounded-2xl bg-white border p-1 shrink-0 overflow-hidden transition-all cursor-pointer relative ${
                    isActive
                      ? 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-xs scale-105 opacity-100'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} Fotoğraf ${i + 1}`}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom Full Screen Modal (Pure CSS modal without framer-motion weight) */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] p-6 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-xs z-10 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Kapat</span>
            </button>
            <div className="relative w-full max-h-[72vh] flex items-center justify-center">
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={800}
                className="max-h-[72vh] w-auto h-auto object-contain rounded-2xl"
              />
            </div>
            <div className="mt-3 text-slate-900 font-extrabold text-sm text-center">
              {product.name} — <span className="text-emerald-600 font-black">Fotoğraf {activeIndex + 1} / {allImages.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
