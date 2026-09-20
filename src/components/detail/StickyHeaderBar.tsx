'use client';

import { ProductImage } from '@/components/ui/ProductImage';
import React, { useState,useEffect } from 'react';
import { Product } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { Scale,Check,ShoppingBag } from 'lucide-react';
import { ProductPriceSummary } from './ProductPriceSummary';

export function StickyHeaderBar({phone}:{phone:Product}) {
  const {addToCompare,removeFromCompare,isInCompare}=useCompare();
  const inCompare=isInCompare(phone.id);
  const [visible,setVisible]=useState(false),[top,setTop]=useState(0);
  useEffect(()=>{
    const header=document.querySelector('header');
    const measure=()=>{setVisible(window.scrollY>350);setTop(header?.getBoundingClientRect().bottom||0);};
    const observer=new ResizeObserver(measure);if(header)observer.observe(header);
    window.addEventListener('scroll',measure,{passive:true});window.addEventListener('resize',measure);measure();
    return()=>{observer.disconnect();window.removeEventListener('scroll',measure);window.removeEventListener('resize',measure);};
  },[]);
  if(!visible)return null;
  return <div data-testid="sticky-product-bar" style={{top}} className="fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md">
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="hidden sm:flex w-10 h-10 rounded-lg shrink-0 overflow-hidden"><ProductImage src={phone.image} alt={phone.name} variant="card" className="w-full h-full" /></div>
        <div className="min-w-0"><p className="text-slate-900 text-xs sm:text-sm font-bold line-clamp-2">{phone.name}</p><p className="hidden sm:block text-xs text-slate-500">{phone.brand}</p></div>
      </div>
      <div className="hidden lg:block text-right"><ProductPriceSummary product={phone} compact /></div>
      <div className="flex items-center gap-2 shrink-0">
        <button aria-label={inCompare?'Karşılaştırmadan çıkar':'Karşılaştırmaya ekle'} onClick={()=>inCompare?removeFromCompare(phone.id):addToCompare(phone)} className={`w-11 h-11 flex items-center justify-center rounded-xl border ${inCompare?'bg-emerald-600 text-white border-emerald-500':'bg-slate-100 text-slate-700 border-slate-200'}`}>{inCompare?<Check className="w-4 h-4"/>:<Scale className="w-4 h-4"/>}</button>
        <a href="#store-section" className="min-h-11 flex items-center justify-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 text-white text-xs font-bold"><ShoppingBag className="w-4 h-4"/><span>Mağazalar</span></a>
      </div>
    </div>
  </div>;
}
