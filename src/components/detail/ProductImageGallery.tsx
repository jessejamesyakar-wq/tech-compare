'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BaseProduct, Product } from '@/lib/types';
import { Maximize2, Zap, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';

interface ProductImageGalleryProps {
  product: BaseProduct | Product;
  activeColorImage?: string;
  activeColorImages?: string[];
}

export function ProductImageGallery({
  product,
  activeColorImage,
  activeColorImages
}: ProductImageGalleryProps) {
  const fallbackImg = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  const defaultImage = activeColorImage || product.image || fallbackImg;

  // Build the unified image array for the current active color
  const allImages = React.useMemo(() => {
    if (activeColorImages && activeColorImages.length > 0) {
      return Array.from(new Set(activeColorImages.filter(Boolean)));
    }
    if (activeColorImage) {
      const extraImages = (product.images || []).filter(Boolean);
      return Array.from(new Set([activeColorImage, ...extraImages]));
    }
    const rawImages = [product.image, ...(product.images || [])].filter(Boolean);
    return Array.from(new Set(rawImages.length > 0 ? rawImages : [fallbackImg]));
  }, [activeColorImage, activeColorImages, product.image, product.images]);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // When active color or its images change, immediately reset gallery to the primary image (index 0)
  useEffect(() => {
    setActiveIndex(0);
    setImgError(false);
  }, [activeColorImage, activeColorImages]);

  const activeImage = imgError ? (allImages[0] || defaultImage) : (allImages[activeIndex] || allImages[0] || defaultImage);

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
      {/* Strict 500px x 500px Square Grid/Flex Main Showcase Stage (Immutable Standard) */}
      <div className="fixed-detail-gallery-stage relative group">
        
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

        {/* Optimized Active Hero Image with 1000x1000 High-Res Resolution & Contain Fit */}
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${product.name} Görsel ${activeIndex + 1}`}
            priority={activeIndex === 0}
            loading={activeIndex === 0 ? 'eager' : 'lazy'}
            fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
            width={1000}
            height={1000}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 500px, 500px"
            onError={() => setImgError(true)}
            className="fixed-detail-main-img group-hover:scale-105 drop-shadow-md transition-transform duration-300"
          />
        </div>
      </div>

      {/* Thumbnail Bar Carousel for All Uploaded Photos */}
      {allImages.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Fotoğraflar ({allImages.length}):
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
                  className={`fixed-product-thumb transition-all cursor-pointer ${
                    isActive
                      ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs scale-105 opacity-100'
                      : 'border border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} Fotoğraf ${i + 1}`}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="fixed-product-thumb-img"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom Full Screen Modal (1000x1000+ Master Layer) */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] p-6 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-[80vw] max-w-[700px] h-[60vh] max-h-[700px] flex items-center justify-center p-4">
              <Image
                src={activeImage}
                alt={`${product.name} - Orijinal Yüksek Çözünürlüklü Görsel`}
                width={1200}
                height={1200}
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="text-center pt-3 border-t border-slate-100 w-full">
              <p className="text-sm font-black text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-400 font-medium">Orijinal Üretici Stüdyo Render Görseli (1000x1000+)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
